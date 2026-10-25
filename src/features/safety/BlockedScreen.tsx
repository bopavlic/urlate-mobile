import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { BlockedUser } from '@/api/generated/model';
import { Avatar } from '@/ui/Avatar';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

/** People I blocked. Unblocking lets us find each other again; lists I left stay gone. */
export function BlockedScreen({
  people,
  onUnblock,
}: {
  people: BlockedUser[];
  onUnblock: (userId: string) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function unblock(person: BlockedUser) {
    setError(null);
    setBusyId(person.userId);
    try {
      await onUnblock(person.userId);
    } catch {
      setError("Couldn't unblock them. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="gap-6 px-6 pb-12">
        <ScreenHeader title="Blocked people" />
        {people.length === 0 ? (
          <Text className="text-base text-muted">You haven’t blocked anyone.</Text>
        ) : (
          <View className="overflow-hidden rounded-2xl bg-surface">
            {people.map((person, index) => (
              <View key={person.userId}>
                {index > 0 ? <View className="ml-[72px] h-px bg-line" /> : null}
                <View className="flex-row items-center gap-3 px-4 py-3.5">
                  <Avatar name={person.displayName} url={person.avatarUrl} size={44} onCard />
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-semibold text-ink" numberOfLines={1}>
                      {person.displayName}
                    </Text>
                    {person.username ? (
                      <Text className="text-sm text-muted" numberOfLines={1}>
                        @{person.username}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Unblock ${person.displayName}`}
                    disabled={busyId !== null}
                    onPress={() => void unblock(person)}
                    className="h-9 justify-center rounded-full bg-paper px-4 active:opacity-80"
                  >
                    <Text className="text-sm font-semibold text-ink">
                      {busyId === person.userId ? 'Unblocking…' : 'Unblock'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
        {error ? <Text className="text-base text-danger">{error}</Text> : null}
        <Text className="text-sm text-muted">
          Blocked people can’t find your username, scan your code or invite you, and you can’t
          invite them. Unblocking doesn’t bring back lists you left.
        </Text>
      </ScrollView>
    </Screen>
  );
}
