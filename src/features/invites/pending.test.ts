import { savePendingInvite, takePendingInvite } from './pending';

// jest.mock is hoisted above the import; the factory reads mockStore only when called.
const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => void mockStore.set(key, value)),
  deleteItemAsync: jest.fn(async (key: string) => void mockStore.delete(key)),
}));

beforeEach(() => mockStore.clear());

it('remembers an invite opened while signed out, until it is taken once', async () => {
  await savePendingInvite('ABCDEFGH');
  expect(await takePendingInvite()).toBe('ABCDEFGH');
  expect(await takePendingInvite()).toBeNull();
});

it('forgets an invite older than a day', async () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
  await savePendingInvite('ABCDEFGH');
  now.mockReturnValue(1_000_000 + 25 * 60 * 60 * 1000);
  expect(await takePendingInvite()).toBeNull();
  now.mockRestore();
});
