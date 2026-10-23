import { render, screen } from '@testing-library/react-native';

import type { LedgerDetail } from '@/api/generated/model';

import { brother, me } from './fixtures';
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
  it('shows a brand-new tally as all square with an inviting empty history', async () => {
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
