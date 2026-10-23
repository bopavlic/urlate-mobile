import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ledgers/new" />
      <Stack.Screen name="ledgers/[id]" />
      <Stack.Screen name="log" />
    </Stack>
  );
}
