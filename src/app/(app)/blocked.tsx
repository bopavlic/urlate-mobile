import { ActivityIndicator, Text } from 'react-native';

import {
  getListBlocksQueryKey,
  unblockPerson,
  useListBlocks,
} from '@/api/generated/endpoints/safety/safety';
import { BlockedScreen } from '@/features/safety/BlockedScreen';
import { queryClient } from '@/providers/query';
import { Screen } from '@/ui/Screen';

export default function BlockedRoute() {
  const blocks = useListBlocks();
  if (!blocks.data) {
    return (
      <Screen className="items-center justify-center">
        {blocks.isError ? (
          <Text className="text-center text-lg text-muted">
            Couldn&apos;t load this. Check your connection.
          </Text>
        ) : (
          <ActivityIndicator />
        )}
      </Screen>
    );
  }
  return (
    <BlockedScreen
      people={blocks.data}
      onUnblock={async (userId) => {
        await unblockPerson(userId);
        await queryClient.invalidateQueries({ queryKey: getListBlocksQueryKey() });
      }}
    />
  );
}
