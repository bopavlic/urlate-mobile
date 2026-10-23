import { Text, View } from 'react-native';

import { useGetMe } from '@/api/generated/endpoints/me/me';
import { signOut } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';

// Temporary home until the tabs arrive (Task 7).
export default function Home() {
  const me = useGetMe();
  return (
    <Screen className="justify-center gap-6">
      <Title>Hi {me.data?.displayName ?? '…'}</Title>
      <Text className="text-lg text-muted">You&apos;re signed in as {me.data?.email}.</Text>
      <View>
        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}
