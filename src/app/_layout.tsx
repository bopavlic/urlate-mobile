import "../../global.css";

import {
  BigShoulders_600SemiBold,
  BigShoulders_800ExtraBold,
  BigShoulders_900Black,
  useFonts,
} from "@expo-google-fonts/big-shoulders";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth";
import { QueryProvider } from "@/providers/query";
import { palette, themeVars } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = palette[scheme];
  const [fontsLoaded] = useFonts({
    BigShoulders_600SemiBold,
    BigShoulders_800ExtraBold,
    BigShoulders_900Black,
  });
  const { data: session, isPending } = authClient.useSession();
  const ready = fontsLoaded && !isPending;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const signedIn = !!session;
  const needsName = signedIn && !session.user.name;
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

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
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!signedIn}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              <Stack.Protected guard={needsName}>
                <Stack.Screen name="onboarding" />
              </Stack.Protected>
              <Stack.Protected guard={signedIn && !needsName}>
                <Stack.Screen name="index" />
              </Stack.Protected>
            </Stack>
          </View>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
