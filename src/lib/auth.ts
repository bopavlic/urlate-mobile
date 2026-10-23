import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

import { configureApiAuth } from '@/api/client';
import { queryClient } from '@/providers/query';

import { apiUrl } from './config';

export const authClient = createAuthClient({
  // The API mounts Better Auth under /v1/auth.
  baseURL: `${apiUrl}/v1/auth`,
  plugins: [
    expoClient({
      scheme: 'urlate',
      storagePrefix: 'urlate',
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});

/** Signs out locally and on the server; the root layout then shows the sign-in screen. */
export async function signOut(): Promise<void> {
  await authClient.signOut().catch(() => undefined);
  queryClient.clear();
}

// Every API call carries the session cookie; a 401 means the session is gone.
configureApiAuth({
  getCookie: () => authClient.getCookie(),
  onUnauthorized: () => {
    void signOut();
  },
});
