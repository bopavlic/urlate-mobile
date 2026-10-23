import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { MinutePicker } from './MinutePicker';

const renderPicker = (value = 5) => {
  const onChange = jest.fn();
  const onStep = jest.fn();
  return render(<MinutePicker value={value} onChange={onChange} onStep={onStep} />).then(() => ({
    onChange,
    onStep,
  }));
};

describe('MinutePicker', () => {
  it('offers the 1, 2, 5, 10, 15 and 30 minute chips', async () => {
    await renderPicker();
    for (const chip of ['1', '2', '5', '10', '15', '30']) {
      expect(screen.getByRole('button', { name: `${chip} min` })).toBeTruthy();
    }
    expect(screen.queryByRole('button', { name: '3 min' })).toBeNull();
  });

  it('picks a chip', async () => {
    const { onChange } = await renderPicker();
    await fireEvent.press(screen.getByRole('button', { name: '30 min' }));
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('lets you type the minutes', async () => {
    const { onChange } = await renderPicker();
    const input = screen.getByLabelText('Minutes late');
    await fireEvent(input, 'focus');
    await fireEvent.changeText(input, '');
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.changeText(input, '45');
    expect(onChange).toHaveBeenLastCalledWith(45);
  });

  it('steps once on a tap and keeps stepping while held', async () => {
    jest.useFakeTimers();
    try {
      const { onStep } = await renderPicker();
      const plus = screen.getByRole('button', { name: 'One minute more' });
      await fireEvent(plus, 'pressIn');
      expect(onStep).toHaveBeenCalledTimes(1);
      await fireEvent(plus, 'pressOut');
      await act(() => jest.advanceTimersByTime(2000));
      expect(onStep).toHaveBeenCalledTimes(1);

      await fireEvent(plus, 'pressIn');
      await act(() => jest.advanceTimersByTime(2000));
      await fireEvent(plus, 'pressOut');
      const held = onStep.mock.calls.length;
      expect(held).toBeGreaterThan(6);
      expect(onStep).toHaveBeenLastCalledWith(1);
      await act(() => jest.advanceTimersByTime(2000));
      expect(onStep).toHaveBeenCalledTimes(held);
    } finally {
      jest.useRealTimers();
    }
  });
});
