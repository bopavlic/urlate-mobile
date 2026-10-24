import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ActivityItem } from '@/api/generated/model';

import { ActivityScreen } from './ActivityScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);

function item(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: 'a1',
    kind: 'ENTRY_LOGGED',
    message: 'Ana says you were 5 min late. Not true? You have 48 hours to dispute it.',
    ledgerId: 'l-pair',
    entryId: 'e1',
    actor: { displayName: 'Ana', avatarUrl: null },
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const base = {
  permission: 'registered' as const,
  onEnableNotifications: jest.fn(),
  onOpenSettings: jest.fn(),
  onPressItem: jest.fn(),
  onLoadMore: jest.fn(),
};

describe('ActivityScreen', () => {
  it('lists what happened and opens the ledger it happened in', async () => {
    const onPressItem = jest.fn();
    await render(<ActivityScreen {...base} items={[item()]} onPressItem={onPressItem} />);
    await fireEvent.press(screen.getByRole('button', { name: /Ana says you were 5 min late/ }));
    expect(onPressItem).toHaveBeenCalledWith(expect.objectContaining({ ledgerId: 'l-pair' }));
  });

  it('marks unread items for screen readers too', async () => {
    await render(<ActivityScreen {...base} items={[item(), item({ id: 'a2', read: true })]} />);
    expect(screen.getAllByRole('button', { name: /^New: / })).toHaveLength(1);
  });

  it('keeps the empty state light', async () => {
    await render(<ActivityScreen {...base} items={[]} />);
    expect(screen.getByText("Nothing new. Everyone's on time, suspiciously.")).toBeTruthy();
  });

  it('offers to turn notifications on, without asking by itself', async () => {
    const onEnableNotifications = jest.fn();
    await render(
      <ActivityScreen
        {...base}
        items={[]}
        permission="undetermined"
        onEnableNotifications={onEnableNotifications}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Turn on notifications' }));
    expect(onEnableNotifications).toHaveBeenCalled();
  });

  it('points to Settings after a no', async () => {
    const onOpenSettings = jest.fn();
    await render(
      <ActivityScreen {...base} items={[]} permission="denied" onOpenSettings={onOpenSettings} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Open Settings' }));
    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('says nothing about notifications once they work or cannot work here', async () => {
    await render(<ActivityScreen {...base} items={[]} permission="unavailable" />);
    expect(screen.queryByRole('button', { name: 'Turn on notifications' })).toBeNull();
  });
});
