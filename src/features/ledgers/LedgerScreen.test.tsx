import { fireEvent, render, screen } from '@testing-library/react-native';

import { Text } from 'react-native';

import type { LedgerDetail } from '@/api/generated/model';

import { brother, entryFixture, me } from './fixtures';
import { LedgerScreen } from './LedgerScreen';

// jest.mock factories run before imports, so the mock module is required inline.
jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));

const fresh: LedgerDetail = {
  id: 'l-new',
  kind: 'PAIR',
  name: null,
  members: [me, brother],
  myBalance: { direction: 'ALL_SQUARE', minutes: 0 },
  lastActivityAt: '2026-10-23T08:00:00.000Z',
  confirmMode: false,
  createdAt: '2026-10-23T08:00:00.000Z',
  balances: [],
  leaderboard: [
    { memberId: me.id, netMinutes: 0 },
    { memberId: brother.id, netMinutes: 0 },
  ],
};

describe('LedgerScreen', () => {
  it('shows a brand-new score as all square with an inviting empty history', async () => {
    await render(
      <LedgerScreen
        detail={fresh}
        history={[]}
        onSettle={jest.fn()}
        onLoadMore={jest.fn()}
        settling={false}
      />,
    );
    expect(screen.getByText('All square')).toBeTruthy();
    expect(screen.getByText("No one's late yet. Give it time.")).toBeTruthy();
    // Same back control and title layout as every other non-tab screen.
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Brother' })).toBeTruthy();
    expect(screen.queryByText('Forgive')).toBeNull();
  });

  it('offers Forgive and Reset to the owed person', async () => {
    await render(
      <LedgerScreen
        detail={{ ...fresh, myBalance: { direction: 'THEY_OWE_YOU', minutes: 18 } }}
        history={[]}
        onSettle={jest.fn()}
        onLoadMore={jest.fn()}
        settling={false}
      />,
    );
    expect(screen.getByText('Brother owes you 18 min')).toBeTruthy();
    expect(screen.getByText('Forgive')).toBeTruthy();
    expect(screen.getByText('Reset')).toBeTruthy();
  });
});

describe('LedgerScreen settling errors', () => {
  it('says so when forgiving fails, instead of failing silently', async () => {
    const onSettle = jest.fn().mockRejectedValue(new Error('offline'));
    await render(
      <LedgerScreen
        detail={{ ...fresh, myBalance: { direction: 'THEY_OWE_YOU', minutes: 18 } }}
        history={[]}
        onSettle={onSettle}
        onLoadMore={jest.fn()}
        settling={false}
      />,
    );
    await fireEvent.press(screen.getByText('Forgive'));
    await fireEvent.press(screen.getByText('Forgive 18 min'));
    expect(onSettle).toHaveBeenCalledWith({ kind: 'FORGIVE', minutes: 18 });
    expect(
      await screen.findByText("Couldn't save that. Check your connection and try again."),
    ).toBeTruthy();
  });
});

describe('LedgerScreen invites', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { router } = require('expo-router') as { router: { push: jest.Mock } };
  beforeEach(() => router.push.mockClear());

  function renderLedger(detail: LedgerDetail) {
    return render(
      <LedgerScreen
        detail={detail}
        history={[]}
        onSettle={jest.fn()}
        onLoadMore={jest.fn()}
        settling={false}
      />,
    );
  }

  it('nudges you to invite a placeholder person so they see the score too', async () => {
    await renderLedger(fresh);
    expect(screen.getByText('Brother isn’t on Ur Late yet.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Invite Brother' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/invite',
      params: { ledgerId: 'l-new' },
    });
  });

  it('stops nudging once they have joined', async () => {
    await renderLedger({ ...fresh, members: [me, { ...brother, isPlaceholder: false }] });
    expect(screen.queryByRole('button', { name: 'Invite Brother' })).toBeNull();
  });

  it('lets anyone in a group invite more people', async () => {
    await renderLedger({
      ...fresh,
      kind: 'GROUP',
      name: 'Football',
      members: [me, { ...brother, isPlaceholder: false }],
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Invite people' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/invite',
      params: { ledgerId: 'l-new' },
    });
  });
});

describe('LedgerScreen trust settings', () => {
  it('switches confirm mode and explains what it does', async () => {
    const onConfirmModeChange = jest.fn();
    await render(
      <LedgerScreen
        detail={fresh}
        history={[]}
        onSettle={jest.fn()}
        onLoadMore={jest.fn()}
        settling={false}
        onConfirmModeChange={onConfirmModeChange}
      />,
    );
    expect(
      screen.getByText('Off: entries count right away and can be disputed for 48 hours.'),
    ).toBeTruthy();
    await fireEvent(screen.getByRole('switch', { name: 'Confirm mode' }), 'valueChange', true);
    expect(onConfirmModeChange).toHaveBeenCalledWith(true);
  });

  it('opens an entry panel when an entry is tapped', async () => {
    const item = { type: 'entry' as const, at: '2026-10-20T16:05:00.000Z', entry: entryFixture() };
    await render(
      <LedgerScreen
        detail={fresh}
        history={[item]}
        onSettle={jest.fn()}
        onLoadMore={jest.fn()}
        settling={false}
        renderEntryPanel={(entry) => <Text>{`panel for ${entry.id}`}</Text>}
      />,
    );
    expect(screen.queryByText('panel for e1')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: /Brother was 5 min late/ }));
    expect(screen.getByText('panel for e1')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /Brother was 5 min late/ }));
    expect(screen.queryByText('panel for e1')).toBeNull();
  });
});
