import { Text, View } from 'react-native';

import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';

// The activity feed (new entries, disputes, accepted invites) arrives with build step 10.
export default function Activity() {
  return (
    <Screen edges={['top']}>
      <Title className="pt-4">Activity</Title>
      <View className="flex-1 items-center justify-center pb-24">
        <Text className="text-center text-lg text-muted">
          Nothing new. Everyone&apos;s on time, suspiciously.
        </Text>
      </View>
    </Screen>
  );
}
