import { fireEvent, render, screen } from '@testing-library/react-native';

import { pairCard } from './fixtures';
import { SharedCardScreen } from './SharedCardScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

describe('SharedCardScreen', () => {
  it('shows a card someone shared, and who shared it', async () => {
    const onOpenApp = jest.fn();
    await render(
      <SharedCardScreen
        card={pairCard}
        errorMessage={null}
        onBack={jest.fn()}
        onOpenApp={onOpenApp}
      />,
    );
    expect(screen.getByText('Brother owes me 18 minutes.')).toBeTruthy();
    expect(screen.getByText('Shared by Borna. The score may have moved since.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Open Ur Late' }));
    expect(onOpenApp).toHaveBeenCalled();
  });

  it('explains a card that is gone', async () => {
    await render(
      <SharedCardScreen
        card={undefined}
        errorMessage="This card has left the pitch."
        onBack={jest.fn()}
        onOpenApp={jest.fn()}
      />,
    );
    expect(screen.getByText('This card has left the pitch.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open Ur Late' })).toBeTruthy();
  });
});
