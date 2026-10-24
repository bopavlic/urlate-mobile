import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

import { takePendingInvite } from '@/features/invites/pending';
import { usePushNotifications } from '@/features/notifications/push';

export default function AppLayout() {
  usePushNotifications();

  // An invite link opened while signed out waited through sign-in; open it now.
  useEffect(() => {
    void takePendingInvite().then((code) => {
      if (code) router.push(`/i/${code}`);
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ledgers/new" />
      <Stack.Screen name="ledgers/[id]" />
      <Stack.Screen name="ledgers/[id]/members" />
      <Stack.Screen name="log" />
      <Stack.Screen name="invite" />
      <Stack.Screen name="join" />
      <Stack.Screen name="entries/[id]/edit" />
    </Stack>
  );
}
