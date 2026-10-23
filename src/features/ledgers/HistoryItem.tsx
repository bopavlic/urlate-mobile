import { Text, View } from 'react-native';

import type { HistoryItem as Item, Member } from '@/api/generated/model';

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

export function HistoryItem({ item, members }: { item: Item; members: Member[] }) {
  const deleted = item.type === 'entry' && item.entry.deletedAt !== null;
  const edited = item.type === 'entry' && item.entry.editedAt !== null;
  const note = item.type === 'entry' ? item.entry.note : null;
  const late = item.type === 'entry' ? nameOf(members, item.entry.lateMemberId) : null;
  // A yellow tab for entries against them, ink for my own, none for settlements.
  const marker = item.type === 'settlement' ? 'bg-line' : late?.isMe ? 'bg-ink' : 'bg-accent';

  return (
    <View className={`flex-row gap-4 py-4 ${deleted ? 'opacity-50' : ''}`}>
      <View className={`mt-1 h-6 w-4 -rotate-6 rounded-sm ${marker}`} />
      <View className="flex-1 gap-1">
        <Text className={`text-lg font-semibold text-ink ${deleted ? 'line-through' : ''}`}>
          {describe(item, members)}
        </Text>
        {note ? <Text className="text-base text-ink">{note}</Text> : null}
        <View className="flex-row flex-wrap gap-x-3">
          <Text className="text-sm text-muted">{formatWhen(new Date(item.at))}</Text>
          {edited ? <Text className="text-sm text-muted">edited</Text> : null}
          {deleted ? <Text className="text-sm text-danger">deleted</Text> : null}
        </View>
      </View>
    </View>
  );
}
