import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform, type ColorValue } from 'react-native';

type MaterialName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const icons = {
  home: { ios: 'house.fill', android: 'home-variant' },
  activity: { ios: 'bell.fill', android: 'bell' },
  profile: { ios: 'person.crop.circle.fill', android: 'account-circle' },
} satisfies Record<string, { ios: SFSymbol; android: MaterialName }>;

export function TabIcon({
  name,
  color,
  size = 24,
}: {
  name: keyof typeof icons;
  color: ColorValue;
  size?: number;
}) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={icons[name].ios} size={size} tintColor={color as string} />;
  }
  return <MaterialCommunityIcons name={icons[name].android} size={size} color={color as string} />;
}
