import { useState, type ReactNode } from 'react';
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
      {member.isPlaceholder && renaming ? renameField : null}
      {member.isPlaceholder && !renaming ? (
        <View className="flex-row gap-3">
          <Button
            title="Invite"
            variant="secondary"
            className="flex-1"
            onPress={onInvite}
            accessibilityLabel={`Invite ${member.displayName}`}
          />
          <Button
            title="Rename"
            variant="ghost"
            className="flex-1"
            onPress={onStartRename}
            accessibilityLabel={`Rename ${member.displayName}`}
          />
          {canRemove ? (
            <Button
              title="Remove"
              variant="ghost"
              className="flex-1"
              onPress={onRemove}
              accessibilityLabel={`Remove ${member.displayName}`}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** What leaving does, worded for the confirmation. */
function leaveCopy(detail: LedgerDetail): { title: string; message: string; action: string } {
  const isGroup = detail.kind === 'GROUP';
  const othersOnApp = detail.members.some((member) => !member.isMe && !member.isPlaceholder);
  if (!othersOnApp) {
    return {
      title: isGroup ? `Delete ${detail.name ?? 'this group'}?` : 'Delete this tally?',
      message:
        'Nobody else here is on Ur Late, so leaving deletes it with all its history. This can’t be undone.',
      action: 'Leave and delete',
    };
  }
  return {
    title: isGroup ? `Leave ${detail.name ?? 'this group'}?` : 'Leave this tally?',
    message:
      'The others keep the score and your entries, under your name. They can invite you back later.',
    action: 'Leave',
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
    const copy = leaveCopy(detail);
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

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="gap-6 px-6 pb-12" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={detail.name ?? 'People'} />
        {isGroup ? (
          <Button title="Share the group's invite link" onPress={() => onInvite(null)} />
        ) : null}

        <View>
          {detail.members.map((member, index) => (
            <View key={member.id}>
              {index > 0 ? <View className="h-px bg-line" /> : null}
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
            {error ? <Text className="text-base text-danger">{error}</Text> : null}
            <Button
              title="Add"
              variant="secondary"
              onPress={add}
              disabled={!trimmed}
              loading={adding}
            />
          </View>
        ) : error ? (
          <Text className="text-base text-danger">{error}</Text>
        ) : null}

        <Button
          title={isGroup ? 'Leave group' : 'Leave this tally'}
          variant="danger"
          loading={leaving}
          onPress={leave}
        />
      </ScrollView>
    </Screen>
  );
}
