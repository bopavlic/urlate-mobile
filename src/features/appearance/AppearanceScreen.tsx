import { Image, Pressable, Text, View } from 'react-native';

import { THEME_IDS, themes, type Scheme, type ThemeId } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { ICONS } from './icons';
import type { IconId } from './switcher';

const FREE_ICON: IconId = 'classic';

/** A thumbnail of the theme in today's light or dark: its page, a row and a ticket. */
function ThemeTile({
  id,
  scheme,
  selected,
  locked,
  onPress,
}: {
  id: ThemeId;
  scheme: Scheme;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  const { label } = themes[id];
  const colors = themes[id][scheme];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label} theme${locked ? ', Premium' : ''}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="w-[30%] gap-2"
    >
      <View
        style={{ backgroundColor: colors.paper, borderColor: selected ? colors.ink : colors.line }}
        className="h-28 justify-between overflow-hidden rounded-2xl border-2 p-3"
      >
        <View style={{ backgroundColor: colors.surface }} className="h-4 w-4/5 rounded-full" />
        <View
          style={{ backgroundColor: colors.surface, transform: [{ rotate: '-6deg' }] }}
          className="h-10 w-14 self-end overflow-hidden rounded-md"
        >
          <View style={{ backgroundColor: colors.accent }} className="h-3" />
        </View>
      </View>
      <View>
        <Text className="text-center text-sm font-semibold text-ink">{label}</Text>
        {locked ? <Text className="text-center text-xs text-muted">Premium</Text> : null}
      </View>
    </Pressable>
  );
}

/** Themes recolour the app; icons change it on the home screen. Classic is free. */
export function AppearanceScreen({
  theme,
  icon,
  scheme,
  unlocked,
  iconsSupported,
  onThemeChange,
  onIconChange,
  onGetPremium,
}: {
  theme: ThemeId;
  icon: IconId;
  scheme: Scheme;
  /** Premium: every theme and icon. */
  unlocked: boolean;
  iconsSupported: boolean;
  onThemeChange: (theme: ThemeId) => void;
  onIconChange: (icon: IconId) => void;
  onGetPremium: () => void;
}) {
  return (
    <Screen scroll>
      <View className="gap-8">
        <ScreenHeader title="Theme and icon" />

        {unlocked ? null : (
          <View className="gap-3 rounded-2xl bg-surface p-5">
            <Text className="text-base text-ink">
              Classic is yours. The other themes and icons come with Premium.
            </Text>
            <Button title="Get Premium" onPress={onGetPremium} />
          </View>
        )}

        <View className="gap-3">
          <Text className="font-display text-lg text-ink">Theme</Text>
          <View
            accessibilityRole="radiogroup"
            className="flex-row flex-wrap justify-between gap-y-4"
          >
            {THEME_IDS.map((id) => {
              const locked = !unlocked && id !== 'classic';
              return (
                <ThemeTile
                  key={id}
                  id={id}
                  scheme={scheme}
                  selected={theme === id}
                  locked={locked}
                  onPress={() => (locked ? onGetPremium() : onThemeChange(id))}
                />
              );
            })}
          </View>
        </View>

        {iconsSupported ? (
          <View className="gap-3">
            <Text className="font-display text-lg text-ink">App icon</Text>
            <View
              accessibilityRole="radiogroup"
              className="flex-row flex-wrap justify-between gap-y-4"
            >
              {ICONS.map((item) => {
                const locked = !unlocked && item.id !== FREE_ICON;
                const selected = icon === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="radio"
                    accessibilityLabel={`${item.label} icon${locked ? ', Premium' : ''}`}
                    accessibilityState={{ selected }}
                    onPress={() => (locked ? onGetPremium() : onIconChange(item.id))}
                    className="w-[30%] items-center gap-2"
                  >
                    <View
                      className={`rounded-[24px] border-2 p-0.5 ${selected ? 'border-ink' : 'border-transparent'}`}
                    >
                      <Image source={item.preview} className="h-[72px] w-[72px] rounded-[18px]" />
                    </View>
                    <View>
                      <Text className="text-center text-sm font-semibold text-ink">
                        {item.label}
                      </Text>
                      {locked ? (
                        <Text className="text-center text-xs text-muted">Premium</Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
