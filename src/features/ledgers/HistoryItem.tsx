import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { HistoryItem as Item, Member } from '@/api/generated/model';
import { entryStatusLabel } from '@/features/entries/status';

import { formatWhen } from './when';

function nameOf(members: Member[], memberId: string): { name: string; isMe: boolean } {
  const member = members.find((m) => m.id === memberId);
  return { name: member?.displayName || 'Someone', isMe: !!member?.isMe };
}

function describe(item: Item, members: Member[]): string {
  if (item.type === 'entry') {
    const late = nameOf(members, item.entry.lateMemberId);
    return late.isMe
      ? `You were ${item.entry.minutes} min late`
      : `${late.name} was ${item.entry.minutes} min late`;
  }
  const actor = nameOf(members, item.settlement.fromMemberId);
  const who = actor.isMe ? 'You' : actor.name;
  return item.settlement.kind === 'RESET'
    ? `${who} reset it to all square`
    : `${who} forgave ${item.settlement.minutes} min`;
}

export function HistoryItem({
  item,
  members,
  onPress,
  expanded = false,
  children,
}: {
  item: Item;
  members: Member[];
  /** Entries open a panel of actions and earlier versions underneath. */
  onPress?: () => void;
  expanded?: boolean;
  children?: ReactNode;
}) {
  const entry = item.type === 'entry' ? item.entry : null;
  const deleted = !!entry?.deletedAt;
  const edited = !!entry?.editedAt;
  const struck = deleted || entry?.status === 'REJECTED';
  // Pending, disputed and rejected entries don't count right now: show them faded.
  const counts = !entry || (entry.status === 'ACTIVE' && !deleted);
  const status = entry ? entryStatusLabel(entry, members) : null;
  const needsMe = !!entry && (entry.actions.confirm || entry.actions.reject);
  const late = entry ? nameOf(members, entry.lateMemberId) : null;
  // A yellow tab for entries against them, ink for my own, none for settlements.
  const marker = item.type === 'settlement' ? 'bg-line' : late?.isMe ? 'bg-ink' : 'bg-accent';

  const row = (
    <View className="flex-row gap-4 py-4">
      <View
        className={`mt-1 h-6 w-4 -rotate-6 rounded-sm ${marker} ${counts ? '' : 'opacity-40'}`}
      />
      <View className={`flex-1 gap-1 ${counts ? '' : 'opacity-60'}`}>
        <Text className={`text-lg font-semibold text-ink ${struck ? 'line-through' : ''}`}>
          {describe(item, members)}
        </Text>
        {entry?.note ? <Text className="text-base text-ink">{entry.note}</Text> : null}
        <View className="flex-row flex-wrap gap-x-3">
          <Text className="text-sm text-muted">{formatWhen(new Date(item.at))}</Text>
          {edited ? <Text className="text-sm text-muted">edited</Text> : null}
          {deleted ? <Text className="text-sm text-danger">deleted</Text> : null}
        </View>
      </View>
    </View>
  );

  return (
    <View>
      {onPress && entry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityHint="Shows what you can do with this entry"
          onPress={onPress}
        >
          {row}
        </Pressable>
      ) : (
        row
      )}
      {status ? (
        // Outside the faded block: the reason it doesn't count must stay readable.
        <Text
          className={`-mt-2 pb-3 pl-8 text-sm font-semibold ${needsMe ? 'text-ink' : 'text-muted'}`}
        >
          {status}
        </Text>
      ) : null}
      {expanded ? <View className="pb-4 pl-8">{children}</View> : null}
    </View>
  );
}
