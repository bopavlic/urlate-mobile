import { fireEvent, render, screen } from '@testing-library/react-native';

import type { BlockedUser } from '@/api/generated/model';

import { BlockedScreen } from './BlockedScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const ana: BlockedUser = {
  userId: 'u-ana',
  displayName: 'Ana',
  username: 'ana',
  avatarUrl: null,
  blockedAt: '2026-10-25T10:00:00.000Z',
};

describe('BlockedScreen', () => {
  it('lists blocked people and unblocks one', async () => {
    const onUnblock = jest.fn().mockResolvedValue(undefined);
    await render(<BlockedScreen people={[ana]} onUnblock={onUnblock} />);
    expect(screen.getByText('@ana')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Unblock Ana' }));
    expect(onUnblock).toHaveBeenCalledWith('u-ana');
  });

  it('says when nobody is blocked', async () => {
    await render(<BlockedScreen people={[]} onUnblock={jest.fn()} />);
    expect(screen.getByText('You haven’t blocked anyone.')).toBeTruthy();
  });
});
