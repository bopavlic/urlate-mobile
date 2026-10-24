import { fireEvent, render, screen } from '@testing-library/react-native';

import { AppearanceScreen } from './AppearanceScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('./icons', () => ({
  ICONS: [
    { id: 'classic', label: 'Classic', preview: 1 },
    { id: 'red-card', label: 'Red card', preview: 2 },
  ],
}));

const base = {
  theme: 'classic' as const,
  icon: 'classic' as const,
  iconsSupported: true,
  scheme: 'light' as const,
  onThemeChange: jest.fn(),
  onIconChange: jest.fn(),
  onGetPremium: jest.fn(),
};

it('lets Premium pick any theme and icon', async () => {
  const onThemeChange = jest.fn();
  const onIconChange = jest.fn();
  await render(
    <AppearanceScreen
      {...base}
      unlocked
      onThemeChange={onThemeChange}
      onIconChange={onIconChange}
    />,
  );
  expect(
    screen.getByRole('radio', { name: 'Classic theme' }).props.accessibilityState,
  ).toMatchObject({ selected: true });
  await fireEvent.press(screen.getByRole('radio', { name: 'Away kit theme' }));
  expect(onThemeChange).toHaveBeenCalledWith('away-kit');
  await fireEvent.press(screen.getByRole('radio', { name: 'Red card icon' }));
  expect(onIconChange).toHaveBeenCalledWith('red-card');
  expect(screen.queryByRole('button', { name: 'Get Premium' })).toBeNull();
});

it('keeps the others for Premium, and offers it instead', async () => {
  const onThemeChange = jest.fn();
  const onGetPremium = jest.fn();
  await render(
    <AppearanceScreen
      {...base}
      unlocked={false}
      onThemeChange={onThemeChange}
      onGetPremium={onGetPremium}
    />,
  );
  await fireEvent.press(screen.getByRole('radio', { name: 'Floodlights theme, Premium' }));
  expect(onThemeChange).not.toHaveBeenCalled();
  expect(onGetPremium).toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('radio', { name: 'Classic theme' }));
  expect(onThemeChange).toHaveBeenCalledWith('classic');
});

it('leaves out icons where the phone can’t change them', async () => {
  await render(<AppearanceScreen {...base} unlocked iconsSupported={false} />);
  expect(screen.queryByText('App icon')).toBeNull();
});
