import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, FlatList, Pressable, Switch, Text, View } from 'react-native';

import type { Entry, HistoryItem as Item, LedgerDetail } from '@/api/generated/model';
import { BigBalance } from '@/ui/BigBalance';
import { Button } from '@/ui/Button';
import { LateButton } from '@/ui/LateButton';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { balanceSentence } from '@/features/balance/copy';
import { Avatar } from '@/ui/Avatar';

import { HistoryItem } from './HistoryItem';
import { myScores, settleOptions, type SettleRequest } from './settle';

export type { SettleRequest };

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));
  return (
    <View className="flex-row items-center justify-center gap-6">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="One minute less"
        onPress={() => step(-1)}
        className="h-12 w-12 items-center justify-center rounded-full border-2 border-ink"
      >
        <Text className="font-display text-3xl text-ink">−</Text>
      </Pressable>
      <Text className="min-w-20 text-center font-display text-5xl text-ink">{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="One minute more"
        onPress={() => step(1)}
        className="h-12 w-12 items-center justify-center rounded-full border-2 border-ink"
      >
        <Text className="font-display text-3xl text-ink">+</Text>
      </Pressable>
    </View>
  );
}

/** Placeholders can't see the score; inviting them is how a tally becomes shared. */
function InviteNudge({ detail }: { detail: LedgerDetail }) {
  const openInvite = () => router.push({ pathname: '/invite', params: { ledgerId: detail.id } });
  if (detail.kind === 'GROUP') {
    return <Button title="Invite" variant="secondary" onPress={openInvite} />;
  }
  const other = detail.members.find((member) => !member.isMe);
  if (!other?.isPlaceholder) return null;
  return (
    <View className="gap-3 rounded-2xl border-2 border-line p-4">
      <Text className="text-base text-ink">{other.displayName} isn’t on Ur Late yet.</Text>
      <Text className="text-base text-muted">Invite them so they see the score too.</Text>
      <Button title={`Invite ${other.displayName}`} variant="secondary" onPress={openInvite} />
    </View>
  );
}

/** Either person can switch it; the other is told (activity + push). */
function ConfirmModeSetting({
  on,
  saving,
  onChange,
}: {
  on: boolean;
  saving: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl border-2 border-line p-4">
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-ink">Confirm mode</Text>
        <Text className="text-sm text-muted">
          {on
            ? 'On: new entries wait for a yes from whoever was late.'
            : 'Off: entries count right away and can be disputed for 48 hours.'}
        </Text>
      </View>
      <Switch
        accessibilityLabel="Confirm mode"
        value={on}
        disabled={saving}
        onValueChange={onChange}
      />
    </View>
  );
}

/** Most minutes owed first: the top of the board is whoever keeps everyone waiting. */
function Leaderboard({ detail }: { detail: LedgerDetail }) {
  const rows = [...detail.leaderboard].sort((a, b) => a.netMinutes - b.netMinutes);
  return (
    <View className="gap-3">
      <Text className="font-display-bold text-2xl text-ink">Leaderboard</Text>
      {rows.every((row) => row.netMinutes === 0) ? (
        <Text className="text-base text-muted">No one&apos;s late yet. Give it time.</Text>
      ) : (
        rows.map((row, index) => {
          const member = detail.members.find((m) => m.id === row.memberId);
          const name = member?.isMe ? 'You' : (member?.displayName ?? 'Someone');
          const owes = row.netMinutes < 0;
          const standing = owes
            ? `owes ${-row.netMinutes} min`
            : row.netMinutes > 0
              ? `owed ${row.netMinutes} min`
              : 'square';
          return (
            <View
              key={row.memberId}
              className="flex-row items-center gap-3"
              accessible
              accessibilityLabel={`${index + 1}. ${name}, ${standing}`}
            >
              <Text className="w-6 font-display-bold text-xl text-muted">{index + 1}</Text>
              <Avatar name={name} url={member?.avatarUrl} size={36} />
              <Text className="flex-1 text-base text-ink" numberOfLines={1}>
                {name}
              </Text>
              {/* The worst offender gets the card. */}
              <Text
                className={`font-semibold ${
                  index === 0 && owes
                    ? '-rotate-3 rounded-md bg-accent px-2 py-1 text-on-accent'
                    : 'rotate-0 text-ink'
                }`}
              >
                {standing}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

/** Forgive some minutes or reset to zero: only ever by the person who is owed. */
function SettleControls({
  owedMinutes,
  counterpartMemberId,
  settling,
  onSettle,
}: {
  owedMinutes: number;
  counterpartMemberId: string;
  settling: boolean;
  onSettle: (request: SettleRequest) => Promise<boolean>;
}) {
  const [forgiving, setForgiving] = useState(false);
  const [minutes, setMinutes] = useState(owedMinutes);
  const chosen = Math.min(minutes, owedMinutes);

  function confirmReset() {
    Alert.alert('Wipe the slate?', "This can't be undone, but it stays in history.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => void onSettle({ kind: 'RESET', counterpartMemberId }),
      },
    ]);
  }

  if (!forgiving) {
    return (
      <View className="flex-row gap-3">
        <Button
          title="Forgive"
          variant="secondary"
          className="flex-1"
          onPress={() => {
            setMinutes(owedMinutes);
            setForgiving(true);
          }}
        />
        <Button title="Reset" variant="secondary" className="flex-1" onPress={confirmReset} />
      </View>
    );
  }

  return (
    <View className="gap-4 rounded-2xl border-2 border-line p-4">
      <Text className="text-center text-base text-muted">How many minutes to let go?</Text>
      <Stepper value={chosen} min={1} max={owedMinutes} onChange={setMinutes} />
      <View className="flex-row gap-3">
        <Button
          title="Cancel"
          variant="ghost"
          className="flex-1"
          onPress={() => setForgiving(false)}
        />
        <Button
          title={`Forgive ${chosen} min`}
          className="flex-1"
          loading={settling}
          onPress={async () => {
            const saved = await onSettle({ kind: 'FORGIVE', minutes: chosen, counterpartMemberId });
            if (saved) setForgiving(false);
          }}
        />
      </View>
    </View>
  );
}

/** Groups stay pairwise: my score with each person, and settling one person at a time. */
function GroupScores({
  detail,
  settling,
  onSettle,
}: {
  detail: LedgerDetail;
  settling: boolean;
  onSettle: (request: SettleRequest) => Promise<boolean>;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const scores = myScores(detail);
  if (scores.length === 0) return null;
  return (
    <View className="gap-3">
      <Text className="font-display-bold text-2xl text-ink">You and each of them</Text>
      {scores.map(({ member, view }) => {
        const sentence = balanceSentence(view, member.displayName);
        const owed = view.direction === 'THEY_OWE_YOU';
        const expanded = open === member.id;
        return (
          <View key={member.id} className="gap-3">
            {owed ? (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityHint="Forgive or reset"
                onPress={() => setOpen(expanded ? null : member.id)}
                className="flex-row items-center justify-between py-1 active:opacity-70"
              >
                <Text className="text-base font-semibold text-ink">{sentence}</Text>
                <Text className="text-base text-muted underline">Settle</Text>
              </Pressable>
            ) : (
              <Text className="py-1 text-base text-ink">{sentence}</Text>
            )}
            {owed && expanded ? (
              <SettleControls
                owedMinutes={view.minutes}
                counterpartMemberId={member.id}
                settling={settling}
                onSettle={async (request) => {
                  const saved = await onSettle(request);
                  if (saved) setOpen(null);
                  return saved;
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function LedgerScreen({
  detail,
  history,
  onSettle,
  onLoadMore,
  settling,
  refreshing = false,
  onRefresh,
  onConfirmModeChange,
  savingConfirmMode = false,
  renderEntryPanel,
}: {
  detail: LedgerDetail;
  history: Item[];
  onSettle: (request: SettleRequest) => Promise<void> | void;
  onLoadMore: () => void;
  settling: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onConfirmModeChange?: (on: boolean) => void;
  savingConfirmMode?: boolean;
  /** Actions and earlier versions under a tapped entry. */
  renderEntryPanel?: (entry: Entry) => ReactNode;
}) {
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const other = detail.members.find((member) => !member.isMe);
  const title = detail.name ?? other?.displayName ?? 'Someone';
  const settle = settleOptions(detail);
  const [settleError, setSettleError] = useState<string | null>(null);
  const isGroup = detail.kind === 'GROUP';

  async function trySettle(request: SettleRequest): Promise<boolean> {
    setSettleError(null);
    try {
      await onSettle(request);
      return true;
    } catch {
      setSettleError("Couldn't save that. Check your connection and try again.");
      return false;
    }
  }

  const header = (
    <View className="gap-8 pb-6">
      <ScreenHeader title={title} />

      <BigBalance view={detail.myBalance} otherName={other?.displayName ?? ''} kind={detail.kind} />

      <View className="items-center">
        <LateButton ledgerId={detail.id} />
      </View>

      {!isGroup && settle.canSettle && settle.counterpartId ? (
        <SettleControls
          key={settle.owedMinutes}
          owedMinutes={settle.owedMinutes}
          counterpartMemberId={settle.counterpartId}
          settling={settling}
          onSettle={trySettle}
        />
      ) : null}

      {isGroup ? <Leaderboard detail={detail} /> : null}
      {isGroup ? <GroupScores detail={detail} settling={settling} onSettle={trySettle} /> : null}

      {settleError ? <Text className="text-base text-danger">{settleError}</Text> : null}

      <Button
        title="Share the score"
        variant="secondary"
        onPress={() => router.push({ pathname: '/ledgers/[id]/share', params: { id: detail.id } })}
      />

      {isGroup ? (
        <View className="flex-row gap-3">
          <Button
            title={`People (${detail.members.length})`}
            variant="secondary"
            className="flex-1"
            onPress={() =>
              router.push({ pathname: '/ledgers/[id]/members', params: { id: detail.id } })
            }
          />
          <View className="flex-1">
            <InviteNudge detail={detail} />
          </View>
        </View>
      ) : (
        <InviteNudge detail={detail} />
      )}

      {onConfirmModeChange ? (
        <ConfirmModeSetting
          on={detail.confirmMode}
          saving={savingConfirmMode}
          onChange={onConfirmModeChange}
        />
      ) : null}

      <Text className="font-display-bold text-2xl text-ink">History</Text>
    </View>
  );

  return (
    <Screen edges={['top']} padded={false}>
      <FlatList
        data={history}
        keyExtractor={(item) => (item.type === 'entry' ? item.entry.id : item.settlement.id)}
        contentContainerClassName="px-6 pb-16"
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View className="h-px bg-line" />}
        renderItem={({ item }) => {
          const entry = item.type === 'entry' ? item.entry : null;
          const open = !!entry && entry.id === openEntryId;
          return (
            <HistoryItem
              item={item}
              members={detail.members}
              expanded={open}
              onPress={
                entry && renderEntryPanel ? () => setOpenEntryId(open ? null : entry.id) : undefined
              }
            >
              {open && entry ? renderEntryPanel?.(entry) : null}
            </HistoryItem>
          );
        }}
        extraData={openEntryId}
        onEndReached={onLoadMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text className="py-8 text-center text-lg text-muted">
            No one&apos;s late yet. Give it time.
          </Text>
        }
      />
    </Screen>
  );
}
