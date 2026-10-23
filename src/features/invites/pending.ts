import * as SecureStore from 'expo-secure-store';

// An invite link opened while signed out waits here through sign-in (which may send the
// user to their mail app and back), then the app opens it once they're in.

const KEY = 'urlate.pendingInvite';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function savePendingInvite(code: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify({ code, savedAt: Date.now() }));
}

/** The waiting invite code, removed so it opens only once. */
export async function takePendingInvite(): Promise<string | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  await SecureStore.deleteItemAsync(KEY);
  try {
    const { code, savedAt } = JSON.parse(raw) as { code: string; savedAt: number };
    return Date.now() - savedAt <= MAX_AGE_MS ? code : null;
  } catch {
    return null;
  }
}
