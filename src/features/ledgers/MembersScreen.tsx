import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import type { LedgerDetail, Member } from '@/api/generated/model';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { MenuList, MenuRow } from '@/ui/MenuList';
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

function RenameField({
  member,
  onSave,
  onCancel,
}: {
  member: Member;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(member.displayName);
  const [saving, setSaving] = useState(false);
  const trimmed = name.trim();
  async function save() {
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  }
  return (
    <View className="gap-3">
      <TextField
        label={`New name for ${member.displayName}`}
        value={name}
        onChangeText={setName}
        maxLength={40}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <View className="flex-row gap-3">
        <Button
          title="Save"
          accessibilityLabel="Save name"
          className="flex-1"
          disabled={!trimmed}
          loading={saving}
          onPress={save}
        />
        <Button title="Cancel" variant="ghost" className="flex-1" onPress={onCancel} />
      </View>
    </View>
  );
}

function MemberRow({
  member,
  canRemove,
  renaming,
  onInvite,
  onRemove,
  onStartRename,
  renameField,
}: {
  member: Member;
  canRemove: boolean;
  renaming: boolean;
  onInvite: () => void;
  onRemove: () => void;
  onStartRename: () => void;
  renameField: ReactNode;
}) {
  const name = member.isMe ? 'You' : member.displayName;
  const subline = member.isMe
    ? 'That’s you'
    : member.isPlaceholder
      ? 'Not on Ur Late yet'
      : member.username
        ? `@${member.username}`
        : 'On Ur Late';
  return (
    <View className="gap-3 px-4 py-3.5">
      <View className="flex-row items-center gap-3">
        <Avatar name={member.displayName} url={member.avatarUrl} size={44} onCard />
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-semibold text-ink" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-sm text-muted" numberOfLines={1}>
            {subline}
          </Text>
          {member.isPlaceholder && !renaming ? (
            <View className="flex-row gap-4 pt-1">
              <Text
                accessibilityRole="button"
                accessibilityLabel={`Rename ${member.displayName}`}
                onPress={onStartRename}
                className="text-sm font-semibold text-ink underline"
              >
                Rename
              </Text>
              {canRemove ? (
                <Text
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${member.displayName}`}
                  onPress={onRemove}
                  className="text-sm font-semibold text-danger underline"
                >
                  Remove
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
        {member.isPlaceholder && !renaming ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Invite ${member.displayName}`}
            onPress={onInvite}
            className="h-9 justify-center rounded-full bg-accent px-4 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-on-accent">Invite</Text>
          </Pressable>
        ) : null}
      </View>
      {member.isPlaceholder && renaming ? renameField : null}
    </View>
  );
}

/** What leaving does, worded for the confirmation (also used by a long press on Home). */
export function leaveCopy(detail: Pick<LedgerDetail, 'kind' | 'members' | 'name'>): {
  title: string;
  message: string;
  action: string;
  /** The button that starts it. */
  label: string;
  /** Under that button: what happens, before anyone taps it. */
  hint: string;
} {
  const isGroup = detail.kind === 'GROUP';
  const othersOnApp = detail.members.some((member) => !member.isMe && !member.isPlaceholder);
  const other = detail.members.find((member) => !member.isMe)?.displayName ?? 'them';
  const groupName = detail.name ?? 'this group';
  const label = isGroup ? 'Leave group' : `Remove ${other} from your list`;
  if (!othersOnApp) {
    return {
      title: isGroup ? `Delete ${groupName}?` : `Delete everything with ${other}?`,
      message:
        'Nobody else here is on Ur Late, so leaving deletes it with all its history. This can’t be undone.',
      action: 'Leave and delete',
      label,
      hint: isGroup
        ? 'Nobody else here is on Ur Late, so leaving deletes the group and its history.'
        : `${other} isn’t on Ur Late, so this deletes every minute between you.`,
    };
  }
  return {
    title: isGroup ? `Leave ${groupName}?` : `Stop keeping track with ${other}?`,
    message: `${isGroup ? 'The others keep' : `${other} keeps`} your entries, under your name. ${
      isGroup ? 'They' : `${other}`
    } can invite you back later.`,
    action: 'Leave',
    label,
    hint: isGroup
      ? 'The others keep your entries and can invite you back.'
      : `${other} keeps the history and can add you back later.`,
  };
}

/**
 * Who is in a ledger: invite people who aren't on the app, rename them, add or remove
 * them (groups only), or leave.
 */
export function MembersScreen({
  detail,
  onAdd,
  onRemove,
  onInvite,
  onRename,
  onLeave,
}: {
  detail: LedgerDetail;
  onAdd: (name: string) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
  /** null = the group's open link, for anyone. */
  onInvite: (memberId: string | null) => void;
  onRename: (memberId: string, name: string) => Promise<void>;
  onLeave: () => Promise<void>;
}) {
  const isGroup = detail.kind === 'GROUP';
  const copy = leaveCopy(detail);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
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

  async function rename(member: Member, newName: string) {
    setError(null);
    try {
      await onRename(member.id, newName);
      setRenamingId(null);
    } catch (err) {
      setError(memberErrorMessage((err as MemberError).code, member.displayName));
    }
  }

  function leave() {
    Alert.alert(copy.title, copy.message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: copy.action,
        style: 'destructive',
        onPress: () => {
          setError(null);
          setLeaving(true);
          onLeave().catch(() => {
            setLeaving(false);
            setError("Couldn't leave. Check your connection and try again.");
          });
        },
      },
    ]);
  }

  const other = detail.members.find((member) => !member.isMe);
  const title = isGroup ? (detail.name ?? 'People') : `You & ${other?.displayName ?? 'them'}`;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="gap-6 px-6 pb-12" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={title} />
        {isGroup ? (
          <Button title="Share the group's invite link" onPress={() => onInvite(null)} />
        ) : null}

        <View className="gap-2">
          {isGroup ? (
            <Text className="font-display text-lg text-ink">{detail.members.length} people</Text>
          ) : null}
          <View className="overflow-hidden rounded-2xl bg-surface">
            {detail.members.map((member, index) => (
              <View key={member.id}>
                {index > 0 ? <View className="ml-[72px] h-px bg-line" /> : null}
                <MemberRow
                  member={member}
                  canRemove={isGroup}
                  renaming={renamingId === member.id}
                  onInvite={() => onInvite(member.id)}
                  onRemove={() => remove(member)}
                  onStartRename={() => setRenamingId(member.id)}
                  renameField={
                    <RenameField
                      member={member}
                      onSave={(newName) => rename(member, newName)}
                      onCancel={() => setRenamingId(null)}
                    />
                  }
                />
              </View>
            ))}
          </View>
        </View>

        {isGroup ? (
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
            <Button title="Add" onPress={add} disabled={!trimmed} loading={adding} />
          </View>
        ) : null}

        {error ? <Text className="text-base text-danger">{error}</Text> : null}

        <View className="gap-2">
          <MenuList>
            <MenuRow title={copy.label} tone="danger" loading={leaving} onPress={leave} />
          </MenuList>
          <Text className="px-1 text-sm text-muted">{copy.hint}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
