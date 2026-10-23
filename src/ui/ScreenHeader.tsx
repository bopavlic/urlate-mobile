import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, Text, useColorScheme, View } from 'react-native';

import { palette } from '@/theme/tokens';

import { Title } from './Title';

/** The one back control: a pill with a chevron and the word Back, top left. */
export function BackButton({ onPress }: { onPress: () => void }) {
  const color = palette[useColorScheme() === 'dark' ? 'dark' : 'light'].ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={8}
      className="h-11 flex-row items-center gap-1 self-start rounded-full bg-surface pl-2 pr-4 active:opacity-70"
    >
      {Platform.OS === 'ios' ? (
        <SymbolView name="chevron.left" size={16} weight="bold" tintColor={color} />
      ) : (
        <MaterialCommunityIcons name="chevron-left" size={24} color={color} />
      )}
      <Text className="text-base font-semibold text-ink">Back</Text>
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
