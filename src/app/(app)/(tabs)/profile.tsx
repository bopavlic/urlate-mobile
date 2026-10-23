import { Text, View } from 'react-native';

import { useGetMe } from '@/api/generated/endpoints/me/me';
import { signOut } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';

// Avatar, name and username editing arrive in the profile task.
export default function Profile() {
  const me = useGetMe();
  return (
    <Screen edges={['top']} className="gap-4 pt-4">
      <Title>{me.data?.displayName ?? 'Profile'}</Title>
      <Text className="text-lg text-muted">{me.data?.email}</Text>
      <View className="mt-4">
        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}
