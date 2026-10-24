import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Linking } from 'react-native';

import {
  getListActivityQueryKey,
  markActivityRead,
} from '@/api/generated/endpoints/activity/activity';
import { ActivityScreen } from '@/features/activity/ActivityScreen';
import { refreshActivity, useActivityFeed } from '@/features/activity/queries';
import { clearBadge, usePushPermission } from '@/features/notifications/push';
import { queryClient } from '@/providers/query';

export default function Activity() {
  const feed = useActivityFeed();
  const { permission, enable } = usePushPermission();
  const unread = feed.data?.pages[0]?.unreadCount ?? 0;

  // Seeing the feed reads it: the badges clear, but items stay bold until the next visit
  // so the new ones are still easy to spot now.
  useFocusEffect(
    useCallback(() => {
      clearBadge();
      if (unread === 0) return;
      void markActivityRead()
        .then(() =>
          queryClient.invalidateQueries({ queryKey: getListActivityQueryKey({ limit: 1 }) }),
        )
        .catch(() => undefined);
    }, [unread]),
  );

  return (
    <ActivityScreen
      items={feed.data?.pages.flatMap((page) => page.items) ?? []}
      loading={feed.isPending}
      error={feed.isError}
      permission={permission}
      onEnableNotifications={() => void enable()}
      onOpenSettings={() => void Linking.openSettings()}
      onPressItem={(item) =>
        router.push({ pathname: '/ledgers/[id]', params: { id: item.ledgerId } })
      }
      onLoadMore={() => {
        if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
      }}
      refreshing={feed.isRefetching && !feed.isFetchingNextPage}
      onRefresh={() => void refreshActivity()}
    />
  );
}
