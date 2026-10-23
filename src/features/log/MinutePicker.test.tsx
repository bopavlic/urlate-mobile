import { fireEvent, render, screen } from '@testing-library/react-native';

import { MinutePicker } from './MinutePicker';

describe('MinutePicker', () => {
  it('offers exactly the 1, 2, 5, 10 and 15 minute chips', async () => {
    await render(<MinutePicker value={5} onChange={jest.fn()} onStep={jest.fn()} />);
    for (const chip of ['1', '2', '5', '10', '15']) {
      expect(screen.getByRole('button', { name: `${chip} min` })).toBeTruthy();
    }
    expect(screen.queryByRole('button', { name: '3 min' })).toBeNull();
  });

  it('picks a chip and steps', async () => {
    const onChange = jest.fn();
    const onStep = jest.fn();
    await render(<MinutePicker value={5} onChange={onChange} onStep={onStep} />);
    await fireEvent.press(screen.getByRole('button', { name: '10 min' }));
    expect(onChange).toHaveBeenCalledWith(10);
    await fireEvent.press(screen.getByRole('button', { name: 'One minute more' }));
    expect(onStep).toHaveBeenCalledWith(1);
  });
});
