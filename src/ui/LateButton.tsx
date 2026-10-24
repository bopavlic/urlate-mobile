import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

/** The floating button you tap when someone's late, tilted like a ticket. Opens the quick log. */
export function LateButton({
  ledgerId,
  className = '',
}: {
  ledgerId?: string;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log someone being late"
      onPress={() => router.push(ledgerId ? { pathname: '/log', params: { ledgerId } } : '/log')}
      style={{ transform: [{ rotate: '-3deg' }] }}
      className={`h-14 flex-row items-center justify-center rounded-2xl bg-accent px-6 shadow-lg shadow-black/25 active:opacity-90 ${className}`}
    >
      <Text className="font-display text-lg text-on-accent">+ Someone’s late</Text>
    </Pressable>
  );
}
