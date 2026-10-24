// Review Focus: a double-tapped or retried Save must log once. Every save from one open
// of the log screen sends the same clientRequestId; the API then counts it once.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { brother } from '@/features/ledgers/fixtures';

const mockMutateAsync = jest.fn();
let mockKind: 'PAIR' | 'GROUP' = 'PAIR';
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
    const ana = { ...fixtures.brother, id: 'm-ana', displayName: 'Ana' };
    return mockKind === 'PAIR'
      ? { data: { kind: 'PAIR', members: [fixtures.me, fixtures.brother] } }
      : { data: { kind: 'GROUP', members: [fixtures.me, fixtures.brother, ana] } };
  },
}));
jest.mock('@/features/ledgers/queries', () => ({
  refreshLedgers: jest.fn(),
  useLedgers: () => ({ isPending: false, data: { pages: [] } }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Log = require('../app/(app)/log').default;

it('has a Back button that leaves the screen', async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { router } = require('expo-router');
  await render(<Log />);
  await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(router.back).toHaveBeenCalled();
});

it('retries a failed save with the same request id', async () => {
  mockMutateAsync.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce({});
  await render(<Log />);

  await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/Couldn't save/)).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2));
  const ids = mockMutateAsync.mock.calls.map((call) => call[0].data.clientRequestId);
  expect(ids[0]).toEqual(expect.any(String));
  expect(ids[1]).toBe(ids[0]);
  expect(mockMutateAsync.mock.calls[0][0]).toMatchObject({
    id: 'l-pair',
    data: { lateMemberId: brother.id, minutes: 5 },
  });
});

describe('in a group', () => {
  beforeEach(() => {
    mockKind = 'GROUP';
    mockMutateAsync.mockReset().mockResolvedValue({});
  });
  afterEach(() => {
    mockKind = 'PAIR';
  });

  it('logs only the people who were there as waiters', async () => {
    await render(<Log />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Ana' }));
    // I can't leave myself out: only people who were there can log it.
    expect(screen.getByRole('checkbox', { name: 'Me' }).props.accessibilityState).toMatchObject({
      checked: true,
      disabled: true,
    });
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Brother' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
    expect(mockMutateAsync.mock.calls[0][0].data).toMatchObject({
      lateMemberId: 'm-ana',
      waiterMemberIds: ['m-me'],
    });
  });
});
