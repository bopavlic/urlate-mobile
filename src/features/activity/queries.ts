import {
  useListActivity,
  useListActivityInfinite,
} from '@/api/generated/endpoints/activity/activity';
import { queryClient } from '@/providers/query';

const cursorPaging = {
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (last: { nextCursor: string | null }) => last.nextCursor ?? undefined,
};

export function useActivityFeed() {
  return useListActivityInfinite({ limit: 30 }, { query: cursorPaging });
}

/** For the tab badge: one tiny page, read only for its unread count. */
export function useUnreadCount(): number {
  const query = useListActivity({ limit: 1 }, { query: { select: (page) => page.unreadCount } });
  return query.data ?? 0;
}

/** After a push arrives or the feed is marked read. */
export function refreshActivity(): Promise<void> {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey.some((part) => typeof part === 'string' && part.startsWith('/activity')),
  });
}
