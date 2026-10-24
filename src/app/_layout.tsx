import '../../global.css';

import { Archivo_700Bold, Archivo_800ExtraBold } from '@expo-google-fonts/archivo';
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { authClient } from '@/lib/auth';
import { QueryProvider } from '@/providers/query';
import { AppearanceProvider, useAppearance } from '@/theme/appearance';
import { themeVars } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <Root />
    </AppearanceProvider>
  );
}

function Root() {
  const { scheme, theme, colors } = useAppearance();
  const [fontsLoaded] = useFonts({
    ArchivoBlack_400Regular,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
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
          <View style={[{ flex: 1 }, themeVars(scheme, theme)]}>
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
              {/* Invite and share links (urlate.app/i/…, /s/…) open signed in or out. */}
              <Stack.Screen name="i/[code]" />
              <Stack.Screen name="s/[id]" />
            </Stack>
          </View>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
