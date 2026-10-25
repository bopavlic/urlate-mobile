import { fireEvent, render, screen } from '@testing-library/react-native';

import { ReportScreen } from './ReportScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

function setup(overrides: Partial<Parameters<typeof ReportScreen>[0]> = {}) {
  const props = {
    subject: 'Ana',
    onSend: jest.fn().mockResolvedValue(undefined),
    onDone: jest.fn(),
    ...overrides,
  };
  return { props, view: render(<ReportScreen {...props} />) };
}

describe('ReportScreen', () => {
  it('sends a reason and optional details', async () => {
    const { props, view } = setup();
    await view;
    expect(screen.getByText('Report Ana')).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Harassment or bullying' }));
    await fireEvent.changeText(screen.getByLabelText('Anything else we should know?'), ' Rude ');
    await fireEvent.press(screen.getByRole('button', { name: 'Send report' }));
    expect(props.onSend).toHaveBeenCalledWith('HARASSMENT', 'Rude');
    expect(await screen.findByText('Thanks for telling us.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(props.onDone).toHaveBeenCalled();
  });

  it('needs a reason first', async () => {
    const { props, view } = setup();
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Send report' }));
    expect(props.onSend).not.toHaveBeenCalled();
  });

  it('says when today’s reports are used up', async () => {
    const { view } = setup({ onSend: jest.fn().mockRejectedValue({ code: 'TOO_MANY_REPORTS' }) });
    await view;
    await fireEvent.press(screen.getByRole('radio', { name: 'Spam' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Send report' }));
    expect(await screen.findByText(/a lot of reports for one day/)).toBeTruthy();
  });
});
