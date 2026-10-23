import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';

/** The stopwatch motif: SF Symbol on iOS, Material icon on Android. */
export function Stopwatch({ size = 24, color }: { size?: number; color: string }) {
  if (Platform.OS === 'ios') {
    return <SymbolView name="stopwatch.fill" size={size} tintColor={color} type="hierarchical" />;
  }
  return <MaterialCommunityIcons name="timer" size={size} color={color} />;
}
