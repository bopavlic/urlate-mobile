import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import type { ActivityItem } from '@/api/generated/model';
import { formatWhen } from '@/features/ledgers/when';
import type { RegisterResult } from '@/features/notifications/register';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';

/** Asked for here, after the person can see what notifications are for; never on launch. */
function NotificationsPrompt({
  permission,
  onEnable,
  onOpenSettings,
}: {
  permission: RegisterResult | null;
  onEnable: () => void;
  onOpenSettings: () => void;
}) {
  if (permission !== 'undetermined' && permission !== 'denied') return null;
  return (
    <View className="mb-4 gap-3 rounded-2xl bg-surface p-4">
      <Text className="text-base text-ink">
        {permission === 'undetermined'
          ? 'Know the moment someone logs you late, so you can dispute it in time.'
          : 'Notifications are off for Ur Late, so disputes and new entries only show up here.'}
      </Text>
      {permission === 'undetermined' ? (
        <Button title="Turn on notifications" onPress={onEnable} />
      ) : (
        <Button title="Open Settings" variant="secondary" onPress={onOpenSettings} />
      )}
    </View>
  );
}

function ActivityRow({ item, onPress }: { item: ActivityItem; onPress: () => void }) {
  const name = item.actor?.displayName ?? 'Ur Late';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.read ? '' : 'New: '}${item.message}`}
      onPress={onPress}
      className="flex-row gap-4 py-4 active:opacity-70"
    >
      <Avatar name={name} url={item.actor?.avatarUrl} size={40} />
      <View className="flex-1 gap-1">
        <Text className={`text-base text-ink ${item.read ? '' : 'font-semibold'}`}>
          {item.message}
        </Text>
        <Text className="text-sm text-muted">{formatWhen(new Date(item.createdAt))}</Text>
      </View>
      {/* Unread: an accent dot. */}
      {item.read ? null : <View className="mt-2 h-3 w-3 rounded-full bg-accent" />}
    </Pressable>
  );
}

export function ActivityScreen({
  items,
  loading = false,
  error = false,
  permission,
  onEnableNotifications,
  onOpenSettings,
  onPressItem,
  onLoadMore,
  refreshing = false,
  onRefresh,
}: {
  items: ActivityItem[];
  loading?: boolean;
  error?: boolean;
  permission: RegisterResult | null;
  onEnableNotifications: () => void;
  onOpenSettings: () => void;
  onPressItem: (item: ActivityItem) => void;
  onLoadMore: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <Screen edges={['top']} padded={false}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerClassName="grow px-6 pb-16"
        ListHeaderComponent={
          <View>
            <Title className="pb-4 pt-4">Activity</Title>
            <NotificationsPrompt
              permission={permission}
              onEnable={onEnableNotifications}
              onOpenSettings={onOpenSettings}
            />
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-px bg-line" />}
        renderItem={({ item }) => <ActivityRow item={item} onPress={() => onPressItem(item)} />}
        onEndReached={onLoadMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pb-24 pt-16">
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-center text-lg text-muted">
                {error
                  ? "Couldn't load your activity. Pull to try again."
                  : "Nothing new. Everyone's on time, suspiciously."}
              </Text>
            )}
          </View>
        }
      />
    </Screen>
  );
}
