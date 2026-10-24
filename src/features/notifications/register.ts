// Getting an Expo push token and handing it to the API. The native calls are injected
// (see push.ts) so the order of steps can be tested without a phone.

export type Permission = 'granted' | 'denied' | 'undetermined';
export type RegisterResult = Permission | 'registered' | 'unavailable';

export type PushDeps = {
  /** Push tokens only exist on real devices. */
  isDevice: boolean;
  platform: string;
  /** The EAS project id; without one Expo can't issue tokens. */
  projectId: string | undefined;
  getPermission: () => Promise<Permission>;
  requestPermission: () => Promise<Permission>;
  setupChannel: () => Promise<void>;
  getToken: (projectId: string) => Promise<string>;
  register: (token: string, platform: 'IOS' | 'ANDROID') => Promise<void>;
  unregister: (token: string) => Promise<void>;
};

/** The token this device registered for the signed-in account, so sign-out can remove it. */
let registeredToken: string | null = null;

/**
 * Registers this device when notifications are allowed. Only asks the person when `ask`
 * is set, i.e. after they tapped "Turn on notifications".
 */
export async function registerForPush(
  deps: PushDeps,
  { ask }: { ask: boolean },
): Promise<RegisterResult> {
  if (!deps.isDevice || !deps.projectId) return 'unavailable';
  if (deps.platform !== 'ios' && deps.platform !== 'android') return 'unavailable';

  // Android 13+ only shows the permission prompt once a channel exists.
  if (deps.platform === 'android') await deps.setupChannel();
  let permission = await deps.getPermission();
  if (permission === 'undetermined' && ask) permission = await deps.requestPermission();
  if (permission !== 'granted') return permission;

  const token = await deps.getToken(deps.projectId);
  await deps.register(token, deps.platform === 'ios' ? 'IOS' : 'ANDROID');
  registeredToken = token;
  return 'registered';
}

/** Stops pushes for the account that is signing out. Never throws. */
export async function unregisterPush(deps: Pick<PushDeps, 'unregister'>): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  await deps.unregister(token).catch(() => undefined);
}
