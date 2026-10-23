import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, useColorScheme } from 'react-native';

import { palette } from '@/theme/tokens';

/** Closes a modal screen: a round, thumb-sized button in the top-left corner. */
export function CloseButton({
  onPress,
  label = 'Cancel',
}: {
  onPress: () => void;
  label?: string;
}) {
  const color = palette[useColorScheme() === 'dark' ? 'dark' : 'light'].ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-70"
    >
      {Platform.OS === 'ios' ? (
        <SymbolView name="xmark" size={18} weight="bold" tintColor={color} />
      ) : (
        <MaterialCommunityIcons name="close" size={22} color={color} />
      )}
    </Pressable>
  );
}
