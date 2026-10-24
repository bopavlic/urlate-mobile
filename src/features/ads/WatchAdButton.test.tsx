import { fireEvent, render, screen } from '@testing-library/react-native';

import { WatchAdButton } from './WatchAdButton';

const offer = {
  show: true,
  disabled: false,
  label: 'Watch an ad: unlock for 24 hours',
  note: '3 ads left today.',
};

describe('WatchAdButton', () => {
  it('offers the ad with today’s count', async () => {
    const onWatch = jest.fn();
    await render(<WatchAdButton offer={offer} state="idle" onWatch={onWatch} />);
    expect(screen.getByText('3 ads left today.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: offer.label }));
    expect(onWatch).toHaveBeenCalled();
  });

  it('says what happened after the ad', async () => {
    const { rerender } = await render(
      <WatchAdButton offer={offer} state="closed" onWatch={jest.fn()} />,
    );
    expect(screen.getByText('Closed early, so no reward this time.')).toBeTruthy();
    await rerender(<WatchAdButton offer={offer} state="failed" onWatch={jest.fn()} />);
    expect(screen.getByText('No ad is available right now. Try again later.')).toBeTruthy();
    await rerender(<WatchAdButton offer={offer} state="unlocked" onWatch={jest.fn()} />);
    expect(screen.getByText('Unlocked for 24 hours.')).toBeTruthy();
  });

  it('shows nothing when there is no ad to offer', async () => {
    await render(
      <WatchAdButton offer={{ ...offer, show: false }} state="idle" onWatch={jest.fn()} />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
