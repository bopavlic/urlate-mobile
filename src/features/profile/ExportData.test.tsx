import { fireEvent, render, screen } from '@testing-library/react-native';

import { ExportData } from './ExportData';

it('says so when the export can’t be fetched', async () => {
  const onExport = jest.fn(async () => {
    throw new Error('offline');
  });
  await render(<ExportData onExport={onExport} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Download my data' }));
  expect(onExport).toHaveBeenCalled();
  expect(await screen.findByText(/Couldn't get your data/)).toBeTruthy();
});
