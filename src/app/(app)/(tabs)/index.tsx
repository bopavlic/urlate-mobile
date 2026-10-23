import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { LedgerRow } from '@/features/ledgers/LedgerRow';
import { useLedgers } from '@/features/ledgers/queries';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';

export default function Home() {
  const ledgers = useLedgers();
  const items = ledgers.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Screen edges={['top']} className="px-0">
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Title>Scoreboard</Title>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add someone to the scoreboard"
          onPress={() => router.push('/ledgers/new')}
          className="h-11 w-11 items-center justify-center rounded-full border-2 border-ink active:opacity-70"
        >
          <Text className="font-display text-3xl leading-8 text-ink">+</Text>
        </Pressable>
      </View>

      {ledgers.isPending ? (
        <ActivityIndicator className="mt-16" />
      ) : ledgers.isError && items.length === 0 ? (
        <View className="items-center gap-4 px-6 pt-16">
          <Text className="text-center text-lg text-muted">
            Couldn&apos;t load your scoreboard. Check your connection.
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
            <LedgerRow ledger={item} onPress={() => router.push(`/ledgers/${item.id}`)} />
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
              <Text className="text-center font-display-bold text-3xl text-ink">
                No one&apos;s late yet. Give it time.
              </Text>
              <Button title="Add someone" onPress={() => router.push('/ledgers/new')} />
            </View>
          }
        />
      )}
    </Screen>
  );
}
