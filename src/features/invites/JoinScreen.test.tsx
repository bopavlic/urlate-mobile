import { fireEvent, render, screen } from '@testing-library/react-native';

import type { InvitePreview } from '@/api/generated/model';

import { JoinScreen } from './JoinScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));

const preview: InvitePreview = {
  code: 'ABCDEFGH',
  ledgerKind: 'PAIR',
  ledgerName: null,
  inviterName: 'Borna',
  inviterAvatarUrl: null,
  placeholderName: 'Brother',
  balance: { direction: 'YOU_OWE_THEM', minutes: 18 },
  expiresAt: '2026-11-06T12:00:00.000Z',
};

function renderJoin(props: Partial<Parameters<typeof JoinScreen>[0]> = {}) {
  return render(
    <JoinScreen
      code="ABCDEFGH"
      preview={preview}
      errorMessage={null}
      signedIn
      joining={false}
      onJoin={jest.fn()}
      onSignIn={jest.fn()}
      {...props}
    />,
  );
}

it('shows who invited you, the score you join with and the name they used for you', async () => {
  const onJoin = jest.fn();
  await renderJoin({ onJoin });
  expect(screen.getByRole('header', { name: 'Borna wants to keep score with you' })).toBeTruthy();
  expect(screen.getByText('You owe Borna 18 min')).toBeTruthy();
  expect(screen.getByText('They’ve been calling you “Brother”.')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Join' }));
  expect(onJoin).toHaveBeenCalled();
});

it('asks you to sign in first when you are signed out', async () => {
  const onSignIn = jest.fn();
  await renderJoin({ signedIn: false, onSignIn });
  expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in to join' }));
  expect(onSignIn).toHaveBeenCalled();
});

it('explains a dead invite instead of offering to join', async () => {
  await renderJoin({
    preview: undefined,
    errorMessage: 'That invite has expired. Ask for a fresh one.',
  });
  expect(screen.getByText('That invite has expired. Ask for a fresh one.')).toBeTruthy();
  expect(screen.getByText('ABCD-EFGH')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();
});
