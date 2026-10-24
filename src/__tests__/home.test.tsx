import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { pairLedger } from '@/features/ledgers/fixtures';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

let mockItems: unknown[] = [];
jest.mock('@/features/ledgers/queries', () => ({
  useLedgers: () => ({
    isPending: false,
    isError: false,
    isRefetching: false,
    hasNextPage: false,
    data: { pages: [{ items: mockItems, nextCursor: null }] },
    refetch: jest.fn(),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Home = require('../app/(app)/(tabs)/index').default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router') as { router: { push: jest.Mock } };

beforeEach(() => router.push.mockClear());

it('offers to enter an invite code when you have no one yet', async () => {
  mockItems = [];
  await render(<Home />);
  await fireEvent.press(screen.getByRole('button', { name: 'Enter invite code' }));
  expect(router.push).toHaveBeenCalledWith('/join');
});

it('keeps the invite code entry under the list', async () => {
  mockItems = [pairLedger()];
  await render(<Home />);
  expect(screen.getByText('Brother')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Enter invite code' })).toBeTruthy();
});

it('asks before removing someone on a long press', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  mockItems = [pairLedger()];
  await render(<Home />);
  await fireEvent(screen.getByText('Brother'), 'longPress');
  expect(alert).toHaveBeenCalledWith(
    expect.stringMatching(/Brother/),
    expect.any(String),
    expect.any(Array),
  );
  expect(screen.getByText('Long-press someone to remove them.')).toBeTruthy();
});
