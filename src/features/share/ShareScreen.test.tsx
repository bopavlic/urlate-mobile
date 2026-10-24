import { fireEvent, render, screen } from '@testing-library/react-native';

import { groupCard, pairCard } from './fixtures';
import { ShareScreen } from './ShareScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

function setup(overrides: Partial<Parameters<typeof ShareScreen>[0]> = {}) {
  const props = {
    card: pairCard,
    errorMessage: null,
    onRetry: jest.fn(),
    onShareImage: jest.fn().mockResolvedValue(undefined),
    onShareLink: jest.fn(),
    ...overrides,
  };
  return { props, view: render(<ShareScreen {...props} />) };
}

describe('ShareScreen', () => {
  it('previews the card that will be shared', async () => {
    const { view } = setup();
    await view;
    expect(screen.getByText('Brother owes me 18 minutes.')).toBeTruthy();
    expect(screen.getByText('Brother’s tab')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
    expect(screen.getByText('urlate.app')).toBeTruthy();
  });

  it('ranks who owes a group, most first', async () => {
    const { view } = setup({ card: groupCard });
    await view;
    expect(screen.getByText('Ana owes Football 20 minutes.')).toBeTruthy();
    expect(screen.getByText('Ivo')).toBeTruthy();
    expect(screen.getByText('5 min')).toBeTruthy();
  });

  it('shares the image with the captured card, and the link', async () => {
    const { props, view } = setup();
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Share image' }));
    expect(props.onShareImage).toHaveBeenCalledWith(
      expect.objectContaining({ current: expect.anything() }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Share link' }));
    expect(props.onShareLink).toHaveBeenCalled();
  });

  it('says when the image could not be shared', async () => {
    const { view } = setup({ onShareImage: jest.fn().mockRejectedValue(new Error('no')) });
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Share image' }));
    expect(
      await screen.findByText('Couldn’t make the image. Try sharing the link instead.'),
    ).toBeTruthy();
  });

  it('offers a retry when the card could not be made', async () => {
    const { props, view } = setup({ card: undefined, errorMessage: 'Offline.' });
    await view;
    expect(screen.getByText('Offline.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).toHaveBeenCalled();
  });
});
