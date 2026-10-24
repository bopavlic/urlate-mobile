// An invite link opened while signed out must open again once the person is signed in.
import { Text } from 'react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

let mockPending: string | null = null;
jest.mock('@/features/invites/pending', () => ({
  takePendingInvite: jest.fn(async () => {
    const code = mockPending;
    mockPending = null;
    return code;
  }),
}));

// Push and store purchases need a device; this test is only about the waiting invite.
jest.mock('@/features/notifications/push', () => ({ usePushNotifications: jest.fn() }));
jest.mock('@/features/premium/store', () => ({ usePurchaseUpdates: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const AppLayout = require('../app/(app)/_layout').default;

const routes = {
  '(app)/_layout': AppLayout,
  '(app)/(tabs)/index': () => <Text>home</Text>,
  '(app)/ledgers/new': () => null,
  '(app)/ledgers/[id]': () => null,
  '(app)/log': () => null,
  '(app)/invite': () => null,
  '(app)/join': () => null,
  '(app)/entries/[id]/edit': () => null,
  'i/[code]': () => <Text>join screen</Text>,
};

it('opens the invite that was waiting through sign-in', async () => {
  mockPending = 'ABCDEFGH';
  const router = await renderRouter(routes, { initialUrl: '/' });
  await waitFor(() => expect(router.getPathname()).toBe('/i/ABCDEFGH'));
  expect(screen.getByText('join screen')).toBeTruthy();
});

it('stays home when nothing is waiting', async () => {
  const router = await renderRouter(routes, { initialUrl: '/' });
  await screen.findByText('home');
  expect(router.getPathname()).toBe('/');
});
