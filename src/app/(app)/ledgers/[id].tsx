import { randomUUID } from 'expo-crypto';
import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { useGetLedger } from '@/api/generated/endpoints/ledgers/ledgers';
import { useCreateSettlement } from '@/api/generated/endpoints/settlements/settlements';
import { LedgerScreen, type SettleRequest } from '@/features/ledgers/LedgerScreen';
import { refreshLedgers, useLedgerHistory } from '@/features/ledgers/queries';
import { settleOptions, settlementRequestId, type RequestId } from '@/features/ledgers/settle';
import { Screen } from '@/ui/Screen';

export default function LedgerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useGetLedger(id);
  const history = useLedgerHistory(id);
  const createSettlement = useCreateSettlement();
  // One id per distinct settle request, reused by its retries (see settlementRequestId).
  const requestId = useRef<RequestId | null>(null);

  if (!detail.data) {
    return (
      <Screen className="items-center justify-center">
        {detail.isError ? (
          <Text className="text-center text-lg text-muted">
            Couldn&apos;t load this one. Check your connection.
          </Text>
        ) : (
          <ActivityIndicator />
        )}
      </Screen>
    );
  }

  async function settle(request: SettleRequest) {
    const counterpartMemberId = settleOptions(detail.data!).counterpartId;
    if (!counterpartMemberId) return;
    requestId.current = settlementRequestId(requestId.current, request, randomUUID);
    await createSettlement.mutateAsync({
      id,
      data: { ...request, counterpartMemberId, clientRequestId: requestId.current.id },
    });
    requestId.current = null;
    await refreshLedgers();
  }

  return (
    <LedgerScreen
      detail={detail.data}
      history={history.data?.pages.flatMap((page) => page.items) ?? []}
      onSettle={settle}
      onLoadMore={() => {
        if (history.hasNextPage && !history.isFetchingNextPage) void history.fetchNextPage();
      }}
      settling={createSettlement.isPending}
      refreshing={detail.isRefetching}
      onRefresh={() => void refreshLedgers()}
    />
  );
}
