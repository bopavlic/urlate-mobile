import { Pressable, Text, View } from 'react-native';

import type { Entitlements } from '@/api/generated/model';

import { premiumStatus } from './copy';

/** Profile's way into Premium: an offer for free accounts, the status for subscribers. */
export function PremiumRow({
  entitlements,
  onOpen,
}: {
  entitlements: Entitlements;
  onOpen: () => void;
}) {
  const title = entitlements.premium ? 'Ur Late Premium' : 'Get Ur Late Premium';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onOpen}
      className="flex-row items-center gap-4 rounded-2xl bg-surface p-5 active:opacity-80"
    >
      <View className="h-9 w-7 rotate-6 rounded-[4px] bg-accent" />
      <View className="flex-1 gap-0.5">
        <Text className="font-display-bold text-2xl text-ink">{title}</Text>
        <Text className="text-base text-muted">
          {premiumStatus(entitlements) ?? 'Unlimited groups, every card look, no ads.'}
        </Text>
      </View>
    </Pressable>
  );
}
