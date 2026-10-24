import { fireEvent, render, screen } from '@testing-library/react-native';

import { entryFixture } from '@/features/ledgers/fixtures';

import { EditEntryScreen } from './EditEntryScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() },
}));

describe('EditEntryScreen', () => {
  it('saves only what changed', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    await render(
      <EditEntryScreen entry={entryFixture({ minutes: 5 })} lateName="Brother" onSave={onSave} />,
    );
    expect(screen.getByRole('header', { name: 'Brother was late' })).toBeTruthy();
    const save = screen.getByRole('button', { name: 'Save changes' });
    expect(save.props.accessibilityState).toMatchObject({ disabled: true });

    await fireEvent.press(screen.getByRole('button', { name: '10 min' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSave).toHaveBeenCalledWith({ minutes: 10 });
  });

  it('says that earlier versions stay visible', async () => {
    await render(<EditEntryScreen entry={entryFixture()} lateName="Brother" onSave={jest.fn()} />);
    expect(screen.getByText(/the old version stays in its history/)).toBeTruthy();
  });

  it('shows an error when saving fails', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('offline'));
    await render(
      <EditEntryScreen
        entry={entryFixture({ minutes: 5 })}
        lateName="Borna"
        lateIsMe
        onSave={onSave}
      />,
    );
    expect(screen.getByRole('header', { name: 'You were late' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '10 min' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText(/Couldn't save/)).toBeTruthy();
  });
});
