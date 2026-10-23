import { focusManager, onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as Network from 'expo-network';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

function isClientError(error: unknown): boolean {
  return error instanceof AxiosError && !!error.response && error.response.status < 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      // 4xx answers won't change by asking again; network blips and 5xx get two retries.
      retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
    },
  },
});

// React Native has no window focus/online events; wire them to the app and network state.
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });
  return () => subscription.remove();
});

export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
