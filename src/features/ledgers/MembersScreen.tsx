import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import type { LedgerDetail, Member } from '@/api/generated/model';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';

/** Rejections carry the API's error code (see memberErrorMessage). */
export type MemberError = { code?: string };

export function memberErrorMessage(code: string | undefined, name?: string): string {
  switch (code) {
    case 'NAME_TAKEN':
      return 'Someone here already has that name.';
    case 'GROUP_FULL':
      return 'This group is full: 50 people at most.';
    case 'MEMBER_HAS_HISTORY':
      return `${name ?? 'They'} ${name ? 'is' : 'are'} part of the history, so they stay.`;
    default:
      return "Couldn't save that. Check your connection and try again.";
  }
}

function MemberRow({
  member,
  onInvite,
  onRemove,
}: {
  member: Member;
  onInvite: () => void;
  onRemove: () => void;
}) {
  const name = member.isMe ? 'You' : member.displayName;
  return (
    <View className="gap-3 py-4">
      <View className="flex-row items-center gap-4">
        <Avatar name={member.displayName} url={member.avatarUrl} size={44} />
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-semibold text-ink" numberOfLines={1}>
            {name}
          </Text>
          {member.isPlaceholder ? (
            <Text className="text-sm text-muted">Not on Ur Late yet</Text>
          ) : member.username && !member.isMe ? (
            <Text className="text-sm text-muted">@{member.username}</Text>
          ) : null}
        </View>
      </View>
      {member.isPlaceholder ? (
        <View className="flex-row gap-3">
          <Button
            title="Invite"
            variant="secondary"
            className="flex-1"
            onPress={onInvite}
            accessibilityLabel={`Invite ${member.displayName}`}
          />
          <Button
            title="Remove"
            variant="ghost"
            className="flex-1"
            onPress={onRemove}
            accessibilityLabel={`Remove ${member.displayName}`}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Who is in a group: invite people who aren't on the app, add or remove placeholders. */
export function MembersScreen({
  detail,
  onAdd,
  onRemove,
  onInvite,
}: {
  detail: LedgerDetail;
  onAdd: (name: string) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
  /** null = the group's open link, for anyone. */
  onInvite: (memberId: string | null) => void;
}) {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = name.trim();

  async function add() {
    if (!trimmed) return;
    setError(null);
    setAdding(true);
    try {
      await onAdd(trimmed);
      setName('');
    } catch (err) {
      setError(memberErrorMessage((err as MemberError).code));
    } finally {
      setAdding(false);
    }
  }

  function remove(member: Member) {
    Alert.alert(`Remove ${member.displayName}?`, 'Only possible before they appear in any entry.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setError(null);
          onRemove(member.id).catch((err: unknown) =>
            setError(memberErrorMessage((err as MemberError).code, member.displayName)),
          );
        },
      },
    ]);
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="gap-6 px-6 pb-12" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={detail.name ?? 'People'} />
        <Button title="Share the group's invite link" onPress={() => onInvite(null)} />

        <View>
          {detail.members.map((member, index) => (
            <View key={member.id}>
              {index > 0 ? <View className="h-px bg-line" /> : null}
              <MemberRow
                member={member}
                onInvite={() => onInvite(member.id)}
                onRemove={() => remove(member)}
              />
            </View>
          ))}
        </View>

        <View className="gap-3">
          <TextField
            label="Add someone"
            value={name}
            onChangeText={setName}
            placeholder="Name"
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={add}
          />
          <Text className="text-sm text-muted">
            For someone who isn&apos;t on the app yet. Invite them later and they take over their
            spot, history included.
          </Text>
          {error ? <Text className="text-base text-danger">{error}</Text> : null}
          <Button
            title="Add"
            variant="secondary"
            onPress={add}
            disabled={!trimmed}
            loading={adding}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
