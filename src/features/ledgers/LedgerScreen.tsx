import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, FlatList, Pressable, Switch, Text, View } from 'react-native';

import type { Entry, HistoryItem as Item, LedgerDetail } from '@/api/generated/model';
import { BigBalance } from '@/ui/BigBalance';
import { Button } from '@/ui/Button';
import { LateButton } from '@/ui/LateButton';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { HistoryItem } from './HistoryItem';
import { settleOptions, type SettleRequest } from './settle';

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
    return <Button title="Invite people" variant="secondary" onPress={openInvite} />;
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

function Leaderboard({ detail }: { detail: LedgerDetail }) {
  return (
    <View className="gap-2 rounded-2xl border-2 border-line p-4">
      <Text className="font-display-bold text-2xl text-ink">Leaderboard</Text>
      {detail.leaderboard.map((row) => {
        const member = detail.members.find((m) => m.id === row.memberId);
        const name = member?.isMe ? 'You' : (member?.displayName ?? 'Someone');
        const standing =
          row.netMinutes > 0
            ? `owed ${row.netMinutes} min`
            : row.netMinutes < 0
              ? `owes ${-row.netMinutes} min`
              : 'square';
        return (
          <View key={row.memberId} className="flex-row justify-between">
            <Text className="text-base text-ink">{name}</Text>
            <Text className="text-base font-semibold text-ink">{standing}</Text>
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
  const [forgiving, setForgiving] = useState(false);
  const [forgiveMinutes, setForgiveMinutes] = useState(settle.owedMinutes);
  const [settleError, setSettleError] = useState<string | null>(null);

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

  function confirmReset() {
    Alert.alert('Wipe the slate?', "This can't be undone, but it stays in history.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void trySettle({ kind: 'RESET' }) },
    ]);
  }

  const header = (
    <View className="gap-8 pb-6">
      <ScreenHeader title={title} />

      <BigBalance view={detail.myBalance} otherName={other?.displayName ?? ''} kind={detail.kind} />

      <View className="items-center">
        <LateButton ledgerId={detail.id} />
      </View>

      {settle.canSettle && !forgiving ? (
        <View className="flex-row gap-3">
          <Button
            title="Forgive"
            variant="secondary"
            className="flex-1"
            onPress={() => {
              setForgiveMinutes(settle.owedMinutes);
              setForgiving(true);
            }}
          />
          <Button title="Reset" variant="secondary" className="flex-1" onPress={confirmReset} />
        </View>
      ) : null}

      {settle.canSettle && forgiving ? (
        <View className="gap-4 rounded-2xl border-2 border-line p-4">
          <Text className="text-center text-base text-muted">How many minutes to let go?</Text>
          <Stepper
            value={Math.min(forgiveMinutes, settle.owedMinutes)}
            min={1}
            max={settle.owedMinutes}
            onChange={setForgiveMinutes}
          />
          <View className="flex-row gap-3">
            <Button
              title="Cancel"
              variant="ghost"
              className="flex-1"
              onPress={() => setForgiving(false)}
            />
            <Button
              title={`Forgive ${Math.min(forgiveMinutes, settle.owedMinutes)} min`}
              className="flex-1"
              loading={settling}
              onPress={async () => {
                const saved = await trySettle({
                  kind: 'FORGIVE',
                  minutes: Math.min(forgiveMinutes, settle.owedMinutes),
                });
                if (saved) setForgiving(false);
              }}
            />
          </View>
        </View>
      ) : null}

      {settleError ? <Text className="text-base text-danger">{settleError}</Text> : null}

      <InviteNudge detail={detail} />

      {detail.kind === 'GROUP' ? <Leaderboard detail={detail} /> : null}

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
