import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { Entry, HistoryItem as Item, Settlement } from '@/api/generated/model';

import { brother, entryFixture, me } from './fixtures';
import { HistoryItem } from './HistoryItem';

const members = [me, brother];

const entry = (overrides: Partial<Entry> = {}): Item => ({
  type: 'entry',
  at: '2026-10-20T16:05:00.000Z',
  entry: entryFixture(overrides),
});

const settlement = (overrides: Partial<Settlement> = {}): Item => ({
  type: 'settlement',
  at: '2026-10-21T10:00:00.000Z',
  settlement: {
    id: 's1',
    ledgerId: 'l',
    fromMemberId: me.id,
    toMemberId: brother.id,
    minutes: 8,
    kind: 'FORGIVE',
    createdByUserId: 'u-me',
    createdAt: '2026-10-21T10:00:00.000Z',
    ...overrides,
  },
});

describe('HistoryItem', () => {
  it('says who was late, with the note', async () => {
    await render(<HistoryItem item={entry()} members={members} />);
    expect(screen.getByText('Brother was 5 min late')).toBeTruthy();
    expect(screen.getByText('football')).toBeTruthy();
  });

  it('owns up when I was late', async () => {
    await render(
      <HistoryItem item={entry({ lateMemberId: me.id, minutes: 1 })} members={members} />,
    );
    expect(screen.getByText('You were 1 min late')).toBeTruthy();
  });

  it('marks edited and deleted entries', async () => {
    await render(
      <HistoryItem
        item={entry({
          editedAt: '2026-10-21T00:00:00.000Z',
          deletedAt: '2026-10-22T00:00:00.000Z',
        })}
        members={members}
      />,
    );
    expect(screen.getByText('deleted')).toBeTruthy();
    expect(screen.getByText('edited')).toBeTruthy();
  });

  it('describes forgiving and resetting', async () => {
    await render(<HistoryItem item={settlement()} members={members} />);
    expect(screen.getByText('You forgave 8 min')).toBeTruthy();
    await render(
      <HistoryItem
        item={settlement({ kind: 'RESET', fromMemberId: brother.id, toMemberId: me.id })}
        members={members}
      />,
    );
    expect(screen.getByText('Brother reset it to all square')).toBeTruthy();
  });
});

describe('HistoryItem status', () => {
  it('says why an entry is not counting', async () => {
    await render(<HistoryItem item={entry({ status: 'DISPUTED' })} members={members} />);
    expect(screen.getByText('Brother disputed this')).toBeTruthy();
  });

  it('flags entries waiting for my answer', async () => {
    await render(
      <HistoryItem
        item={entry({
          status: 'PENDING',
          lateMemberId: me.id,
          actions: { edit: false, delete: false, confirm: true, reject: true, dispute: false },
        })}
        members={members}
      />,
    );
    expect(screen.getByText('Waiting for you')).toBeTruthy();
  });

  it('opens its panel when tapped', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(
      <HistoryItem item={entry()} members={members} onPress={onPress}>
        <Text>panel</Text>
      </HistoryItem>,
    );
    expect(screen.queryByText('panel')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: /Brother was 5 min late/ }));
    expect(onPress).toHaveBeenCalled();
    await rerender(
      <HistoryItem item={entry()} members={members} onPress={onPress} expanded>
        <Text>panel</Text>
      </HistoryItem>,
    );
    expect(screen.getByText('panel')).toBeTruthy();
  });
});
