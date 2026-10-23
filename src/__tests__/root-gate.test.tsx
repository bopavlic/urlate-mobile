// The root auth gate: a session refetch while signed out (Better Auth refetches on every
// app focus, e.g. returning from the mail app) must not throw the user off the code screen.
import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { act, renderRouter, screen, testRouter } from 'expo-router/testing-library';

type S = { data: null | { user: { name: string } }; isPending: boolean };
let mockState: S = { data: null, isPending: false };
const mockListeners = new Set<() => void>();
function setSession(next: S) {
  mockState = next;
  mockListeners.forEach((l) => l());
}

jest.mock('../../global.css', () => ({}), { virtual: true });
jest.mock('@expo-google-fonts/big-shoulders', () => ({
  useFonts: () => [true],
  BigShoulders_600SemiBold: 1,
  BigShoulders_800ExtraBold: 2,
  BigShoulders_900Black: 3,
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/providers/query', () => ({ QueryProvider: ({ children }: any) => children }));
jest.mock('@/lib/auth', () => ({
  authClient: {
    useSession: () =>
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react').useSyncExternalStore(
        (l: () => void) => {
          mockListeners.add(l);
          return () => mockListeners.delete(l);
        },
        () => mockState,
      ),
  },
}));
jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RootLayout = require('../app/_layout').default;

it('keeps the code screen when the session is refetched while signed out', async () => {
  const router = await renderRouter(
    {
      _layout: RootLayout,
      'sign-in': () => <Text>sign-in screen</Text>,
      code: () => <Text>code screen</Text>,
      onboarding: () => <Text>onboarding</Text>,
      '(app)/index': () => <Text>home</Text>,
    },
    { initialUrl: '/sign-in' },
  );
  await testRouter.push('/code?email=ana');
  expect(screen.getByText('code screen')).toBeTruthy();

  // App goes to background → Better Auth focus refetch: isPending is true while data is null.
  await act(async () => setSession({ data: null, isPending: true }));
  await act(async () => setSession({ data: null, isPending: false }));

  expect(router.getPathname()).toBe('/code');
});

it('lands on sign-in when a 401 signs the user out', async () => {
  mockState = { data: { user: { name: 'Borna' } }, isPending: false };
  const router = await renderRouter(
    {
      _layout: RootLayout,
      'sign-in': () => <Text>sign-in screen</Text>,
      code: () => <Text>code screen</Text>,
      onboarding: () => <Text>onboarding</Text>,
      '(app)/_layout': () => <Stack />,
      '(app)/index': () => <Text>home</Text>,
      '(app)/ledgers/[id]': () => <Text>ledger</Text>,
    },
    { initialUrl: '/' },
  );
  await testRouter.push('/ledgers/l1');
  expect(screen.getByText('ledger')).toBeTruthy();
  // signOut(): expo plugin clears the session first, then the /sign-out signal refetches.
  await act(async () => setSession({ data: null, isPending: false }));
  await act(async () => setSession({ data: null, isPending: true }));
  await act(async () => setSession({ data: null, isPending: false }));
  expect(router.getPathname()).toBe('/sign-in');
  expect(screen.getByText('sign-in screen')).toBeTruthy();
});
