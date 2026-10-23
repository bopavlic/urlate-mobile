import {
  useGetLedgerHistoryInfinite,
  useListLedgersInfinite,
} from '@/api/generated/endpoints/ledgers/ledgers';
import { queryClient } from '@/providers/query';

// The API pages with an opaque cursor; React Query needs to know where to start and continue.
const cursorPaging = {
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (last: { nextCursor: string | null }) => last.nextCursor ?? undefined,
};

export function useLedgers() {
  return useListLedgersInfinite({ limit: 30 }, { query: cursorPaging });
}

export function useLedgerHistory(ledgerId: string) {
  return useGetLedgerHistoryInfinite(ledgerId, { limit: 30 }, { query: cursorPaging });
}

/** After logging, settling or editing: balances, lists and history all change. */
export function refreshLedgers(): Promise<void> {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey.some((part) => typeof part === 'string' && part.startsWith('/ledgers')),
  });
}
