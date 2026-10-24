import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useEntitlements } from '@/features/premium/queries';
import { useAppearance } from '@/theme/appearance';
import { FREE_THEME } from '@/theme/tokens';

import { appIcons, iconsSupported } from './icons';
import { DEFAULT_ICON } from './switcher';

/**
 * Signed in: themes and icons stay only while Premium does (the API says, through
 * features.themes), and Android applies a new icon once the app is in the background.
 */
export function useAppearanceUpkeep(): void {
  const entitlements = useEntitlements();
  const { theme, setTheme } = useAppearance();
  const allowed = entitlements.data?.features.themes;

  useEffect(() => {
    // Unknown until the API answers: never reset on a failed or pending request.
    if (allowed !== false) return;
    if (theme !== FREE_THEME) setTheme(FREE_THEME);
    if (iconsSupported && appIcons.current() !== DEFAULT_ICON) {
      void appIcons.choose(DEFAULT_ICON).catch(() => undefined);
    }
  }, [allowed, theme, setTheme]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') void appIcons.applyPending().catch(() => undefined);
    });
    return () => subscription.remove();
  }, []);
}
