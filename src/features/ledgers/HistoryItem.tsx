import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { HistoryItem as Item, Member } from '@/api/generated/model';
import { entryStatusLabel } from '@/features/entries/status';

import { formatWhen } from './when';

function nameOf(members: Member[], memberId: string): { name: string; isMe: boolean } {
  const member = members.find((m) => m.id === memberId);
  return { name: member?.displayName || 'Someone', isMe: !!member?.isMe };
}

/** "Ivo and you waited": only when some of the group weren't there. */
function waitedLine(waiterIds: string[], lateId: string, members: Member[]): string | null {
  const others = members.filter((member) => member.id !== lateId);
  if (waiterIds.length >= others.length) return null;
  const waiters = others.filter((member) => waiterIds.includes(member.id));
  // You last, as people say it.
  const names = [
    ...waiters.filter((member) => !member.isMe).map((member) => member.displayName),
    ...(waiters.some((member) => member.isMe) ? ['you'] : []),
  ];
  if (names.length === 0) return null;
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  return `${list} waited`;
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
  const waited = entry ? waitedLine(entry.waiterMemberIds, entry.lateMemberId, members) : null;
  // A stub with the minutes: the accent for entries against them, ink for my own, grey for settlements.
  const marker = item.type === 'settlement' ? 'bg-line' : late?.isMe ? 'bg-ink' : 'bg-accent';
  const markerText =
    item.type === 'settlement' ? 'text-muted' : late?.isMe ? 'text-paper' : 'text-on-accent';
  const stub =
    item.type === 'entry'
      ? `${late?.isMe ? '−' : '+'}${item.entry.minutes}`
      : item.settlement.kind === 'RESET'
        ? '0'
        : `−${item.settlement.minutes}`;

  const row = (
    <View className="flex-row gap-4 py-4">
      <View
        importantForAccessibility="no-hide-descendants"
        className={`mt-0.5 h-7 min-w-10 items-center justify-center rounded-md px-1.5 ${marker} ${counts ? '' : 'opacity-40'}`}
      >
        <Text className={`font-mono-bold text-xs ${markerText}`}>{stub}</Text>
      </View>
      <View className={`flex-1 gap-1 ${counts ? '' : 'opacity-60'}`}>
        <Text className={`text-lg font-semibold text-ink ${struck ? 'line-through' : ''}`}>
          {describe(item, members)}
        </Text>
        {entry?.note ? <Text className="text-base text-ink">{entry.note}</Text> : null}
        {waited ? <Text className="text-sm text-muted">{waited}</Text> : null}
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
