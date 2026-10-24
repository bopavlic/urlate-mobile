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
    look: { style: 'CHALK' as const, cardColor: 'RED' as const },
    onLookChange: jest.fn(),
    lookLocked: false,
    onGetPremium: jest.fn(),
    adOffer: {
      show: true,
      disabled: false,
      label: 'Watch an ad: unlock for 24 hours',
      note: '3 ads left today.',
    },
    adState: 'idle' as const,
    onWatchAd: jest.fn(),
    ...overrides,
  };
  return { props, view: render(<ShareScreen {...props} />) };
}

describe('ShareScreen', () => {
  it('previews the card that will be shared', async () => {
    const { view } = setup();
    await view;
    expect(screen.getByText('Brother owes me 18 minutes.')).toBeTruthy();
    expect(screen.getByText('BROTHER')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
    expect(screen.getByText('urlate.app')).toBeTruthy();
  });

  it('ranks who owes a group, most first', async () => {
    const { view } = setup({ card: groupCard });
    await view;
    expect(screen.getByText('Ana owes Friday lunch 20 minutes.')).toBeTruthy();
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

  it('picks a background and a card colour', async () => {
    const { props, view } = setup();
    await view;
    await fireEvent.press(screen.getByRole('radio', { name: 'Night' }));
    expect(props.onLookChange).toHaveBeenCalledWith({ style: 'PITCH', cardColor: 'RED' });
    await fireEvent.press(screen.getByRole('radio', { name: 'Pink' }));
    expect(props.onLookChange).toHaveBeenCalledWith({ style: 'CHALK', cardColor: 'PINK' });
  });

  it('offers Premium or an ad instead of sharing a locked look', async () => {
    const { props, view } = setup({
      look: { style: 'PITCH', cardColor: 'BLUE' },
      lookLocked: true,
    });
    await view;
    expect(screen.queryByRole('button', { name: 'Share image' })).toBeNull();
    expect(screen.getByText('This look comes with Premium.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Get Premium' }));
    expect(props.onGetPremium).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Watch an ad: unlock for 24 hours' }));
    expect(props.onWatchAd).toHaveBeenCalled();
  });

  it('waits for the card in the new look before sharing it', async () => {
    const { view } = setup({ look: { style: 'PITCH', cardColor: 'BLUE' } });
    await view;
    expect(screen.getByRole('button', { name: 'Share image' })).toBeDisabled();
  });
});
