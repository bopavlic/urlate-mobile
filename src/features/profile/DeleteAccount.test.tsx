import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { DeleteAccount } from './DeleteAccount';

function pressDestructive() {
  const buttons = (jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? []) as {
    text?: string;
    style?: string;
    onPress?: () => void;
  }[];
  buttons.find((button) => button.style === 'destructive')?.onPress?.();
}

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

it('asks before deleting, and explains what happens where others are involved', async () => {
  const onDelete = jest.fn(async () => undefined);
  await render(<DeleteAccount onDelete={onDelete} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Delete account' }));
  expect(Alert.alert).toHaveBeenCalledWith(
    'Delete your account?',
    expect.stringMatching(/Where people with an account are involved/),
    expect.any(Array),
  );
  expect(onDelete).not.toHaveBeenCalled();
});

it('deletes after confirming', async () => {
  const onDelete = jest.fn(async () => undefined);
  await render(<DeleteAccount onDelete={onDelete} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Delete account' }));
  pressDestructive();
  expect(onDelete).toHaveBeenCalled();
});

it('says so when deleting fails', async () => {
  const onDelete = jest.fn(async () => Promise.reject(new Error('offline')));
  await render(<DeleteAccount onDelete={onDelete} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Delete account' }));
  pressDestructive();
  expect(
    await screen.findByText("Couldn't delete your account. Check your connection and try again."),
  ).toBeTruthy();
});

it('reminds a subscriber that the store subscription carries on', async () => {
  await render(<DeleteAccount onDelete={jest.fn()} subscribedIn="the App Store" />);
  await fireEvent.press(screen.getByRole('button', { name: 'Delete account' }));
  expect(Alert.alert).toHaveBeenCalledWith(
    'Delete your account?',
    expect.stringMatching(/doesn’t cancel Premium: cancel it in the App Store/),
    expect.any(Array),
  );
});
