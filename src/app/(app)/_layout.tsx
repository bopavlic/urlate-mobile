import { Stack } from 'expo-router';

// Becomes the tab bar in the next step.
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
