import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, useColorScheme, View } from 'react-native';

import { palette } from '@/theme/tokens';

import { Title } from './Title';

/** The one back control: a round button with a chevron, top left. */
export function BackButton({ onPress }: { onPress: () => void }) {
  const color = palette[useColorScheme() === 'dark' ? 'dark' : 'light'].ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
    >
      {Platform.OS === 'ios' ? (
        <SymbolView name="chevron.left" size={18} weight="bold" tintColor={color} />
      ) : (
        <MaterialCommunityIcons name="chevron-left" size={28} color={color} />
      )}
    </Pressable>
  );
}

/**
 * Header for every screen that isn't a tab: back button on its own row, then the title.
 * Same position and look everywhere, so leaving a screen is always the same gesture.
 */
export function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View className="gap-4 pt-2">
      <BackButton onPress={onBack ?? (() => router.back())} />
      <Title>{title}</Title>
    </View>
  );
}
