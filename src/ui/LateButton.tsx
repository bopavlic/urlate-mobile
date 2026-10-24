import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { useColors } from '@/theme/appearance';

import { Stopwatch } from './Stopwatch';

/** The card (yellow in the classic theme) you pull out when someone's late. Opens the quick log. */
export function LateButton({
  ledgerId,
  className = '',
}: {
  ledgerId?: string;
  className?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log someone being late"
      onPress={() => router.push(ledgerId ? { pathname: '/log', params: { ledgerId } } : '/log')}
      className={`h-16 -rotate-3 flex-row items-center justify-center gap-2 rounded-2xl bg-accent px-7 shadow-lg shadow-black/30 active:scale-95 ${className}`}
    >
      <Stopwatch size={26} color={colors.onAccent} />
      <Text className="font-display text-3xl text-on-accent">+ Late</Text>
    </Pressable>
  );
}
