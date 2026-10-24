import * as SecureStore from 'expo-secure-store';
import { createContext, use, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { FREE_THEME, isThemeId, themes, type Palette, type Scheme, type ThemeId } from './tokens';

// The chosen theme lives on this phone (like the app icon, which is per device), read
// synchronously at launch so the first frame already has the right colours.

const KEY = 'urlate.theme';

export function readSavedTheme(): ThemeId {
  try {
    const saved = SecureStore.getItem(KEY);
    return isThemeId(saved) ? saved : FREE_THEME;
  } catch {
    return FREE_THEME;
  }
}

type Appearance = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  scheme: Scheme;
  colors: Palette;
};

const AppearanceContext = createContext<Appearance | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const scheme: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [theme, setThemeState] = useState<ThemeId>(readSavedTheme);

  function setTheme(next: ThemeId) {
    setThemeState(next);
    try {
      SecureStore.setItem(KEY, next);
    } catch {
      // Not saved: it still applies until the app closes.
    }
  }

  return (
    <AppearanceContext value={{ theme, setTheme, scheme, colors: themes[theme][scheme] }}>
      {children}
    </AppearanceContext>
  );
}

/** Outside the provider (component tests), the classic theme. */
export function useAppearance(): Appearance {
  const appearance = use(AppearanceContext);
  const scheme: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    appearance ?? {
      theme: FREE_THEME,
      setTheme: () => undefined,
      scheme,
      colors: themes[FREE_THEME][scheme],
    }
  );
}

/** The current theme's colours, for the few props that can't take a class (tint colours). */
export function useColors(): Palette {
  return useAppearance().colors;
}
