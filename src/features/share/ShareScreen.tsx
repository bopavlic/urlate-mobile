import { useRef, useState, type ComponentRef, type RefObject } from 'react';
import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';

import type { ShareCard } from '@/api/generated/model';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { ShareCardView } from './ShareCardView';

/**
 * The score as a card to post: the image for Stories, the link for chats (it unfurls into
 * the same card and lands on urlate.app/s/…).
 */
export function ShareScreen({
  card,
  errorMessage,
  onRetry,
  onShareImage,
  onShareLink,
}: {
  card: ShareCard | undefined;
  errorMessage: string | null;
  onRetry: () => void;
  /** Captures the card view and opens the share sheet. */
  onShareImage: (cardView: RefObject<ComponentRef<typeof View> | null>) => Promise<void>;
  onShareLink: () => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  async function shareImage() {
    setImageError(null);
    setSharing(true);
    try {
      await onShareImage(cardRef);
    } catch {
      setImageError('Couldn’t make the image. Try sharing the link instead.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <Screen scroll>
      <View className="gap-6">
        <ScreenHeader title="Share the score" />
        {card ? (
          <>
            <View className="items-center">
              <View className="overflow-hidden rounded-3xl">
                <ShareCardView ref={cardRef} card={card} width={Math.min(screenWidth - 48, 340)} />
              </View>
            </View>
            <Text className="text-base text-muted">
              The image is made for Stories. The link shows the card in any chat and opens the app
              for anyone who has it.
            </Text>
            {imageError ? <Text className="text-base text-danger">{imageError}</Text> : null}
            <View className="gap-3">
              <Button title="Share image" onPress={() => void shareImage()} loading={sharing} />
              <Button title="Share link" variant="secondary" onPress={onShareLink} />
            </View>
          </>
        ) : errorMessage ? (
          <View className="items-center gap-4 pt-8">
            <Text className="text-center text-lg text-danger">{errorMessage}</Text>
            <Button title="Try again" variant="secondary" onPress={onRetry} />
          </View>
        ) : (
          <ActivityIndicator className="mt-16" />
        )}
      </View>
    </Screen>
  );
}
