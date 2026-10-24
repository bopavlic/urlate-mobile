import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { getGetLedgerQueryKey, leaveLedger } from '@/api/generated/endpoints/ledgers/ledgers';
import type { LedgerSummary } from '@/api/generated/model';
import { LedgerRow } from '@/features/ledgers/LedgerRow';
import { leaveCopy } from '@/features/ledgers/MembersScreen';
import { refreshLedgers, useLedgers } from '@/features/ledgers/queries';
import { queryClient } from '@/providers/query';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Ticket } from '@/ui/Ticket';
import { Title } from '@/ui/Title';

/** Someone who installed from an invite page types the code shown there. */
function EnterInviteCode() {
  return <Button title="Enter invite code" variant="ghost" onPress={() => router.push('/join')} />;
}

/** A long press on a row: the same confirmation as leaving from its People screen. */
function confirmRemove(ledger: LedgerSummary) {
  const copy = leaveCopy(ledger);
  Alert.alert(copy.title, copy.message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: copy.action,
      style: 'destructive',
      onPress: () => {
        leaveLedger(ledger.id)
          .then(async () => {
            queryClient.removeQueries({ queryKey: getGetLedgerQueryKey(ledger.id) });
            await refreshLedgers();
          })
          .catch(() => Alert.alert('Couldn’t remove them', 'Check your connection and try again.'));
      },
    },
  ]);
}

export default function Home() {
  const ledgers = useLedgers();
  const items = ledgers.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Screen edges={['top']} padded={false}>
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Title>Who’s late</Title>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add someone"
          onPress={() => router.push('/ledgers/new')}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
        >
          <Text className="font-display text-2xl leading-7 text-ink">+</Text>
        </Pressable>
      </View>

      {ledgers.isPending ? (
        <ActivityIndicator className="mt-16" />
      ) : ledgers.isError && items.length === 0 ? (
        <View className="items-center gap-4 px-6 pt-16">
          <Text className="text-center text-lg text-muted">
            Couldn&apos;t load your list. Check your connection.
          </Text>
          <Button title="Try again" variant="secondary" onPress={() => void ledgers.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(ledger) => ledger.id}
          contentContainerClassName="grow px-6"
          ItemSeparatorComponent={() => <View className="h-px bg-line" />}
          renderItem={({ item }) => (
            <LedgerRow
              ledger={item}
              onPress={() => router.push(`/ledgers/${item.id}`)}
              onLongPress={() => confirmRemove(item)}
            />
          )}
          onEndReached={() => {
            if (ledgers.hasNextPage && !ledgers.isFetchingNextPage) void ledgers.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={ledgers.isRefetching}
              onRefresh={() => void ledgers.refetch()}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-6 pb-24">
              <Ticket
                tone="clear"
                minutes={0}
                offender="NOBODY YET"
                waiter="NOBODY YET"
                scale={0.7}
                tilt={-3}
                style={{ width: 250 }}
              />
              <Text className="text-center font-display text-xl text-ink">
                No one&apos;s late yet. Give it time.
              </Text>
              <Button title="Add someone" onPress={() => router.push('/ledgers/new')} />
              <EnterInviteCode />
            </View>
          }
          ListFooterComponent={
            items.length > 0 ? (
              <View className="items-center gap-1 pt-2">
                <EnterInviteCode />
                <Text className="text-sm text-muted">Long-press someone to remove them.</Text>
              </View>
            ) : undefined
          }
        />
      )}
    </Screen>
  );
}
