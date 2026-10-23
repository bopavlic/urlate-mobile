import '../../global.css';

import {
  BigShoulders_600SemiBold,
  BigShoulders_800ExtraBold,
  BigShoulders_900Black,
  useFonts,
} from '@expo-google-fonts/big-shoulders';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { authClient } from '@/lib/auth';
import { QueryProvider } from '@/providers/query';
import { palette, themeVars } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = palette[scheme];
  const [fontsLoaded] = useFonts({
    BigShoulders_600SemiBold,
    BigShoulders_800ExtraBold,
    BigShoulders_900Black,
  });
  const { data: session, isPending } = authClient.useSession();
  // Better Auth flips isPending on every refetch (each app focus). Only the first answer
  // gates rendering: unmounting the navigator later would throw users off the code screen.
  const [sessionKnown, setSessionKnown] = useState(false);
  if (!sessionKnown && (!isPending || session)) setSessionKnown(true);
  const ready = fontsLoaded && sessionKnown;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const signedIn = !!session;
  const needsName = signedIn && !session.user.name;
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider
          value={{
            ...base,
            colors: {
              ...base.colors,
              background: colors.paper,
              card: colors.paper,
              text: colors.ink,
              border: colors.line,
              primary: colors.ink,
            },
          }}
        >
          <View style={[{ flex: 1 }, themeVars(scheme)]}>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            {/* Order matters: a denied route falls back to the first screen that is allowed. */}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected
                guard={signedIn && !needsName}
                redirectTo={needsName ? '/onboarding' : '/sign-in'}
              >
                <Stack.Screen name="(app)" />
              </Stack.Protected>
              <Stack.Protected guard={needsName}>
                <Stack.Screen name="onboarding" />
              </Stack.Protected>
              <Stack.Protected guard={!signedIn}>
                <Stack.Screen name="sign-in" />
                <Stack.Screen name="code" />
              </Stack.Protected>
            </Stack>
          </View>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
