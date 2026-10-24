import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { MyInviteCode } from './MyInviteCode';

const invite = { code: 'ABCDEFGH', url: 'https://urlate.app/i/ABCDEFGH' };

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

it('shows the QR, the code and the username to give out', async () => {
  const onShare = jest.fn();
  await render(
    <MyInviteCode invite={invite} username="borna" onShare={onShare} onReset={jest.fn()} />,
  );
  expect(screen.getByLabelText('QR code to add you on Ur Late')).toBeTruthy();
  expect(screen.getByText('ABCD-EFGH')).toBeTruthy();
  expect(screen.getByText(/@borna/)).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Share my link' }));
  expect(onShare).toHaveBeenCalled();
});

it('asks before replacing the code, since the old one stops working', async () => {
  const onReset = jest.fn();
  await render(
    <MyInviteCode invite={invite} username={null} onShare={jest.fn()} onReset={onReset} />,
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Make a new code' }));
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] as {
    style?: string;
    onPress?: () => void;
  }[];
  expect(onReset).not.toHaveBeenCalled();
  buttons.find((button) => button.style === 'destructive')?.onPress?.();
  expect(onReset).toHaveBeenCalled();
});
