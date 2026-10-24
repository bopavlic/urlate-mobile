import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';

import type { ShareCard } from '@/api/generated/model';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { ShareCardView } from './ShareCardView';

/** A urlate.app/s/… link opened in the app: the card as it was shared. */
export function SharedCardScreen({
  card,
  errorMessage,
  onBack,
  onOpenApp,
}: {
  card: ShareCard | undefined;
  errorMessage: string | null;
  onBack: () => void;
  onOpenApp: () => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  return (
    <Screen scroll>
      <View className="flex-1 gap-6">
        <ScreenHeader title="Shared score" onBack={onBack} />
        {card ? (
          <>
            <View className="items-center">
              <View className="overflow-hidden rounded-3xl">
                <ShareCardView card={card} width={Math.min(screenWidth - 48, 340)} />
              </View>
            </View>
            <Text className="text-base text-muted">
              Shared by {card.sharedByName}. The score may have moved since.
            </Text>
          </>
        ) : errorMessage ? (
          <Text className="text-lg text-ink">{errorMessage}</Text>
        ) : (
          <ActivityIndicator className="mt-16" />
        )}
        <Button title="Open Ur Late" onPress={onOpenApp} className="mt-auto" />
      </View>
    </Screen>
  );
}
