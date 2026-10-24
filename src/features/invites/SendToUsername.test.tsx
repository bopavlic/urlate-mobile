import { fireEvent, render, screen } from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';

import { SendToUsername } from './SendToUsername';

function apiError(code: string) {
  return new AxiosError('failed', 'ERR', undefined, undefined, {
    status: 404,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { error: { code, message: '' } },
  });
}

const ana = { username: 'ana_k', displayName: 'Ana', avatarUrl: null };

it('finds the person first, then sends the invite to them', async () => {
  const onFind = jest.fn(async () => ana);
  const onSend = jest.fn(async () => undefined);
  await render(<SendToUsername onFind={onFind} onSend={onSend} />);
  await fireEvent.changeText(screen.getByLabelText('Username'), '@Ana_K');
  await fireEvent.press(screen.getByRole('button', { name: 'Find' }));
  expect(onFind).toHaveBeenCalledWith('ana_k');
  await fireEvent.press(await screen.findByRole('button', { name: 'Send to Ana' }));
  expect(onSend).toHaveBeenCalledWith('ana_k');
  expect(await screen.findByText('Sent. Ana will get a notification.')).toBeTruthy();
});

it('says when nobody has that username', async () => {
  const onFind = jest.fn(async () => {
    throw apiError('USER_NOT_FOUND');
  });
  await render(<SendToUsername onFind={onFind} onSend={jest.fn()} />);
  await fireEvent.changeText(screen.getByLabelText('Username'), 'nobody');
  await fireEvent.press(screen.getByRole('button', { name: 'Find' }));
  expect(
    await screen.findByText('Nobody on Ur Late is called @nobody. Check the spelling.'),
  ).toBeTruthy();
});

it('doesn’t look up what can’t be a username', async () => {
  const onFind = jest.fn();
  await render(<SendToUsername onFind={onFind} onSend={jest.fn()} />);
  await fireEvent.changeText(screen.getByLabelText('Username'), 'a b');
  await fireEvent.press(screen.getByRole('button', { name: 'Find' }));
  expect(onFind).not.toHaveBeenCalled();
  expect(screen.getByText('Usernames are 3–20 letters, digits or underscores.')).toBeTruthy();
});
