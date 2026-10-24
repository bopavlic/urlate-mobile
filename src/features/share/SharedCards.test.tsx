import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { pairCard } from './fixtures';
import { SharedCards, sharedByLine } from './SharedCards';

const mine = { ...pairCard, sharedByMe: true };
const theirs = {
  ...pairCard,
  id: '0199f0f0-1234-7000-8000-00000000beef',
  sharedByName: 'Bro',
  sharedByMe: false,
  createdAt: '2026-10-20T09:30:00.000Z',
};

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('sharedByLine', () => {
  it('says who made it and when', () => {
    expect(sharedByLine(mine)).toBe('Made by you on 24 October 2026');
    expect(sharedByLine(theirs)).toBe('Made by Bro on 20 October 2026');
  });
});

describe('SharedCards', () => {
  it('lists the live links and takes one down after asking', async () => {
    const onTakeDown = jest.fn(async () => undefined);
    await render(
      <SharedCards cards={[mine, theirs]} currentId={mine.id} onTakeDown={onTakeDown} />,
    );
    expect(screen.getByText('Made by Bro on 20 October 2026')).toBeTruthy();
    expect(screen.getByText('The card above. Taking it down gives it a new link.')).toBeTruthy();
    const buttons = screen.getAllByRole('button', { name: /^Take down/ });
    await fireEvent.press(buttons[1]!);
    const [title, message, actions] = jest.mocked(Alert.alert).mock.calls.at(-1)!;
    expect(title).toBe('Take this card down?');
    expect(message).toMatch(/link stops working/);
    (actions as { style?: string; onPress?: () => void }[])
      .find((action) => action.style === 'destructive')
      ?.onPress?.();
    expect(onTakeDown).toHaveBeenCalledWith(theirs.id);
  });

  it('shows nothing when no card is live', async () => {
    await render(<SharedCards cards={[]} currentId={null} onTakeDown={jest.fn()} />);
    expect(screen.queryByText('Links that work')).toBeNull();
  });
});
