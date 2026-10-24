import { Text, View } from 'react-native';

import { Button } from '@/ui/Button';

import type { AdOffer } from './offer';

export type WatchAdState =
  'idle' | 'watching' | 'unlocking' | 'unlocked' | 'closed' | 'failed' | 'late';

const MESSAGES: Partial<Record<WatchAdState, string>> = {
  unlocking: 'Unlocking…',
  unlocked: 'Unlocked for 24 hours.',
  closed: 'Closed early, so no reward this time.',
  failed: 'No ad is available right now. Try again later.',
  late: 'Thanks for watching. The unlock is on its way; check back in a minute.',
};

/** The only way ads ever appear: someone taps this. */
export function WatchAdButton({
  offer,
  state,
  onWatch,
}: {
  offer: AdOffer;
  state: WatchAdState;
  onWatch: () => void;
}) {
  if (!offer.show) return null;
  const busy = state === 'watching' || state === 'unlocking';
  return (
    <View className="gap-2">
      <Button
        title={offer.label}
        variant="secondary"
        onPress={onWatch}
        disabled={offer.disabled}
        loading={busy}
      />
      <Text className="text-center text-sm text-muted">{MESSAGES[state] ?? offer.note}</Text>
    </View>
  );
}
