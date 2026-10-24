import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppearanceScreen } from '@/features/appearance/AppearanceScreen';
import { appIcons, iconsSupported } from '@/features/appearance/icons';
import type { IconId } from '@/features/appearance/switcher';
import { useEntitlements } from '@/features/premium/queries';
import { useAppearance } from '@/theme/appearance';

export default function AppearanceRoute() {
  const { theme, setTheme, scheme } = useAppearance();
  const entitlements = useEntitlements();
  const [icon, setIcon] = useState<IconId>(() => appIcons.current());

  return (
    <AppearanceScreen
      theme={theme}
      icon={icon}
      scheme={scheme}
      unlocked={entitlements.data?.features.themes ?? false}
      iconsSupported={iconsSupported}
      onThemeChange={setTheme}
      onIconChange={(next) => {
        const previous = icon;
        setIcon(next);
        appIcons.choose(next).catch(() => {
          setIcon(previous);
          Alert.alert("Couldn't change the icon", 'Try again in a moment.');
        });
      }}
      onGetPremium={() => router.push('/premium')}
    />
  );
}
