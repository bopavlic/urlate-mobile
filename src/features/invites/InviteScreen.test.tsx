import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Invite, LedgerDetail } from '@/api/generated/model';
import { brother, me } from '@/features/ledgers/fixtures';

import { InviteScreen } from './InviteScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));

const pair: LedgerDetail = {
  id: 'l1',
  kind: 'PAIR',
  name: null,
  members: [me, brother],
  myBalance: { direction: 'THEY_OWE_YOU', minutes: 18 },
  lastActivityAt: '2026-10-23T08:00:00.000Z',
  confirmMode: false,
  createdAt: '2026-10-23T08:00:00.000Z',
  balances: [],
  leaderboard: [],
};

const ana = { ...brother, id: 'm-ana', displayName: 'Ana' };
const group: LedgerDetail = {
  ...pair,
  kind: 'GROUP',
  name: 'Football',
  members: [
    me,
    brother,
    ana,
    { ...brother, id: 'm-tin', displayName: 'Tin', isPlaceholder: false },
  ],
};

const invite: Invite = {
  code: 'ABCDEFGH',
  url: 'https://urlate.app/i/ABCDEFGH',
  ledgerId: 'l1',
  memberId: brother.id,
  expiresAt: '2026-11-06T12:00:00.000Z',
};

function renderInvite(props: Partial<Parameters<typeof InviteScreen>[0]> = {}) {
  return render(
    <InviteScreen
      ledger={pair}
      target={brother.id}
      onTargetChange={jest.fn()}
      invite={invite}
      errorMessage={null}
      onShare={jest.fn()}
      onRetry={jest.fn()}
      onFindUser={jest.fn()}
      onSendToUser={jest.fn()}
      {...props}
    />,
  );
}

it('shows the link as a QR code and the code to type after installing', async () => {
  const onShare = jest.fn();
  await renderInvite({ onShare });
  expect(screen.getByRole('header', { name: 'Invite Brother' })).toBeTruthy();
  expect(screen.getByLabelText('QR code for the invite link')).toBeTruthy();
  expect(screen.getByText('ABCD-EFGH')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Share invite link' }));
  expect(onShare).toHaveBeenCalled();
});

it('lets a group invite anyone with the link, or hand over a placeholder', async () => {
  const onTargetChange = jest.fn();
  await renderInvite({ ledger: group, target: null, onTargetChange });
  expect(screen.getByRole('header', { name: 'Invite to Football' })).toBeTruthy();
  expect(
    screen.getByRole('radio', { name: 'Anyone with the link' }).props.accessibilityState,
  ).toMatchObject({ selected: true });
  // Only people who aren't on the app yet can be handed over.
  expect(screen.queryByRole('radio', { name: 'Tin' })).toBeNull();
  await fireEvent.press(screen.getByRole('radio', { name: 'Ana' }));
  expect(onTargetChange).toHaveBeenCalledWith('m-ana');
});

it('waits for the invite, and offers a retry when it fails', async () => {
  const onRetry = jest.fn();
  await renderInvite({ invite: undefined });
  expect(screen.queryByText('ABCD-EFGH')).toBeNull();
  await renderInvite({ invite: undefined, errorMessage: 'Couldn’t reach Ur Late.', onRetry });
  expect(screen.getByText('Couldn’t reach Ur Late.')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
  expect(onRetry).toHaveBeenCalled();
});
