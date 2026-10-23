import { fireEvent, render, screen } from '@testing-library/react-native';

import { ScreenHeader } from './ScreenHeader';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ router: { back: () => mockBack() } }));

describe('ScreenHeader', () => {
  it('shows a Back button and the title on its own line', async () => {
    await render(<ScreenHeader title="Who was late?" />);
    expect(screen.getByRole('header', { name: 'Who was late?' })).toBeTruthy();
    // A visible word, not just an arrow, so the top row doesn't look empty.
    expect(screen.getByText('Back')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('can go somewhere other than back', async () => {
    const onBack = jest.fn();
    await render(<ScreenHeader title="Check your inbox" onBack={onBack} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
