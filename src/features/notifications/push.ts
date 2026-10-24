import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { registerPushToken, removePushToken } from '@/api/generated/endpoints/activity/activity';
import { refreshActivity } from '@/features/activity/queries';
import { refreshLedgers } from '@/features/ledgers/queries';

import { registerForPush, type Permission, type PushDeps, type RegisterResult } from './register';

// While the app is open, still show the banner: someone just logged you late.
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
});

function toPermission(status: Notifications.NotificationPermissionsStatus): Permission {
  if (status.ios?.status === IosAuthorizationStatus.PROVISIONAL) return 'granted';
  if (status.granted) return 'granted';
  return status.canAskAgain ? 'undetermined' : 'denied';
}

export const pushDeps: PushDeps = {
  isDevice: Device.isDevice,
  platform: Platform.OS,
  projectId: (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId,
  getPermission: async () => toPermission(await Notifications.getPermissionsAsync()),
  requestPermission: async () => toPermission(await Notifications.requestPermissionsAsync()),
  setupChannel: async () => {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Ur Late',
      importance: AndroidImportance.HIGH,
    });
  },
  getToken: async (projectId) => (await Notifications.getExpoPushTokenAsync({ projectId })).data,
  register: (token, platform) => registerPushToken({ token, platform }),
  unregister: (token) => removePushToken({ token }),
};

/**
 * Notification permission for the prompt on the Activity tab; `enable` asks and registers.
 * Re-checked when the app comes back, in case it was changed in Settings.
 */
export function usePushPermission(): {
  permission: RegisterResult | null;
  enable: () => Promise<void>;
} {
  const [permission, setPermission] = useState<RegisterResult | null>(null);
  const check = useCallback(() => {
    registerForPush(pushDeps, { ask: false })
      .then(setPermission)
      .catch(() => setPermission('unavailable'));
  }, []);
  useEffect(() => {
    check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => subscription.remove();
  }, [check]);
  const enable = useCallback(async () => {
    setPermission(
      await registerForPush(pushDeps, { ask: true }).catch(() => 'unavailable' as const),
    );
  }, []);
  return { permission, enable };
}

function ledgerIdOf(notification: Notifications.Notification): string | null {
  const ledgerId = notification.request.content.data?.ledgerId;
  return typeof ledgerId === 'string' ? ledgerId : null;
}

/** Signed-in only: keeps the token fresh, refreshes on arrival, opens the ledger on tap. */
export function usePushNotifications(): void {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    // Silent: registers only if notifications were already allowed (tokens can rotate).
    void registerForPush(pushDeps, { ask: false }).catch(() => undefined);
    const received = Notifications.addNotificationReceivedListener(() => {
      void refreshActivity();
      void refreshLedgers();
    });
    return () => received.remove();
  }, []);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const ledgerId = ledgerIdOf(response.notification);
    // Cleared so the same tap doesn't reopen the ledger on the next render or launch.
    void Notifications.clearLastNotificationResponseAsync();
    void refreshActivity();
    if (ledgerId) router.push({ pathname: '/ledgers/[id]', params: { id: ledgerId } });
  }, [response]);
}

export function clearBadge(): void {
  void Notifications.setBadgeCountAsync(0).catch(() => undefined);
}
