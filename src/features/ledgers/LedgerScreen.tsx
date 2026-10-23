import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';

import type { HistoryItem as Item, LedgerDetail } from '@/api/generated/model';
import { BigBalance } from '@/ui/BigBalance';
import { Button } from '@/ui/Button';
import { LateButton } from '@/ui/LateButton';
import { Screen } from '@/ui/Screen';

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
}: {
  detail: LedgerDetail;
  history: Item[];
  onSettle: (request: SettleRequest) => Promise<void> | void;
  onLoadMore: () => void;
  settling: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
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
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text className="font-display text-4xl text-ink">‹</Text>
        </Pressable>
        <Text className="flex-1 font-display text-4xl text-ink" numberOfLines={1}>
          {title}
        </Text>
      </View>

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

      {detail.kind === 'GROUP' ? <Leaderboard detail={detail} /> : null}

      <Text className="font-display-bold text-2xl text-ink">History</Text>
    </View>
  );

  return (
    <Screen edges={['top']} className="px-0">
      <FlatList
        data={history}
        keyExtractor={(item) => (item.type === 'entry' ? item.entry.id : item.settlement.id)}
        contentContainerClassName="px-6 pb-16"
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View className="h-px bg-line" />}
        renderItem={({ item }) => <HistoryItem item={item} members={detail.members} />}
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
