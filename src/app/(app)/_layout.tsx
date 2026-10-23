import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ledgers/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="ledgers/[id]" />
    </Stack>
  );
}
