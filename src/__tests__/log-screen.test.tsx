// Review Focus: a double-tapped or retried Save must log once. Every save from one open
// of the log screen sends the same clientRequestId; the API then counts it once.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { brother } from '@/features/ledgers/fixtures';

const mockMutateAsync = jest.fn();
let mockIds = 0;

jest.mock('expo-crypto', () => ({ randomUUID: () => `req-${++mockIds}` }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ ledgerId: 'l-pair' }),
}));
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));
jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('@/api/generated/endpoints/entries/entries', () => ({
  useCreateEntry: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));
jest.mock('@/api/generated/endpoints/ledgers/ledgers', () => ({
  useGetLedger: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fixtures = require('@/features/ledgers/fixtures');
    return { data: { kind: 'PAIR', members: [fixtures.me, fixtures.brother] } };
  },
}));
jest.mock('@/features/ledgers/queries', () => ({
  refreshLedgers: jest.fn(),
  useLedgers: () => ({ isPending: false, data: { pages: [] } }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Log = require('../app/(app)/log').default;

it('retries a failed save with the same request id', async () => {
  mockMutateAsync.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce({});
  await render(<Log />);

  await fireEvent.press(screen.getByRole('button', { name: 'Log it' }));
  expect(await screen.findByText(/Couldn't save/)).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Log it' }));

  await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
  const ids = mockMutateAsync.mock.calls.map((call) => call[0].data.clientRequestId);
  expect(ids[0]).toEqual(expect.any(String));
  expect(ids[1]).toBe(ids[0]);
  expect(mockMutateAsync.mock.calls[0][0]).toMatchObject({
    id: 'l-pair',
    data: { lateMemberId: brother.id, minutes: 5 },
  });
});
