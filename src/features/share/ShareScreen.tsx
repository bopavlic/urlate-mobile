import { useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';

import type { ShareCard } from '@/api/generated/model';
import type { AdOffer } from '@/features/ads/offer';
import { WatchAdButton, type WatchAdState } from '@/features/ads/WatchAdButton';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { CARD_COLORS, STYLES, type Look } from './look';
import { ShareCardView } from './ShareCardView';

function StyleChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-full border-2 px-4 py-2 ${selected ? 'border-ink bg-ink' : 'border-line'}`}
    >
      <Text className={`text-base font-semibold ${selected ? 'text-paper' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function ColorSwatch({
  label,
  color,
  selected,
  onPress,
}: {
  label: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label} card`}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={4}
      className={`rounded-xl border-[3px] p-0.5 ${selected ? 'border-ink' : 'border-transparent'}`}
    >
      <View
        style={{ backgroundColor: color }}
        className="h-11 w-8 rotate-6 rounded-md border border-line"
      />
    </Pressable>
  );
}

function LookPicker({ look, onChange }: { look: Look; onChange: (look: Look) => void }) {
  return (
    <View className="gap-3">
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {(Object.keys(STYLES) as Look['style'][]).map((style) => (
          <StyleChip
            key={style}
            label={STYLES[style].label}
            selected={look.style === style}
            onPress={() => onChange({ ...look, style })}
          />
        ))}
      </View>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {(Object.keys(CARD_COLORS) as Look['cardColor'][]).map((cardColor) => (
          <ColorSwatch
            key={cardColor}
            label={CARD_COLORS[cardColor].label}
            color={CARD_COLORS[cardColor].card}
            selected={look.cardColor === cardColor}
            onPress={() => onChange({ ...look, cardColor })}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * The score as a card to post: the image for Stories, the link for chats (it unfurls into
 * the same card and lands on urlate.app/s/…). The classic look is free; the others come with
 * Premium or a day's ad reward.
 */
export function ShareScreen({
  card,
  errorMessage,
  onRetry,
  onShareImage,
  onShareLink,
  look,
  onLookChange,
  lookLocked,
  onGetPremium,
  adOffer,
  adState,
  onWatchAd,
  sharedCards,
}: {
  card: ShareCard | undefined;
  errorMessage: string | null;
  onRetry: () => void;
  /** Captures the card view and opens the share sheet. */
  onShareImage: (cardView: RefObject<ComponentRef<typeof View> | null>) => Promise<void>;
  onShareLink: () => void;
  look: Look;
  onLookChange: (look: Look) => void;
  /** The picked look needs Premium (or an ad reward) this account doesn't have. */
  lookLocked: boolean;
  onGetPremium: () => void;
  adOffer: AdOffer;
  adState: WatchAdState;
  onWatchAd: () => void;
  /** The ledger's live links, to take down (see SharedCards). */
  sharedCards?: ReactNode;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  // After picking a look, the card in that look is still being made.
  const ready = card?.style === look.style && card.cardColor === look.cardColor;

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
                <ShareCardView
                  ref={cardRef}
                  card={card}
                  look={look}
                  width={Math.min(screenWidth - 48, 340)}
                />
              </View>
            </View>
            <LookPicker look={look} onChange={onLookChange} />
            {lookLocked ? (
              <View className="gap-3 rounded-2xl bg-surface p-5">
                <Text className="font-display-bold text-2xl text-ink">
                  This look comes with Premium.
                </Text>
                <Button title="Get Premium" onPress={onGetPremium} />
                <WatchAdButton offer={adOffer} state={adState} onWatch={onWatchAd} />
              </View>
            ) : (
              <>
                <Text className="text-base text-muted">
                  The image is made for Stories. The link shows the card in any chat and opens the
                  app for anyone who has it.
                </Text>
                {imageError ? <Text className="text-base text-danger">{imageError}</Text> : null}
                <View className="gap-3">
                  <Button
                    title="Share image"
                    onPress={() => void shareImage()}
                    loading={sharing}
                    disabled={!ready}
                  />
                  <Button
                    title="Share link"
                    variant="secondary"
                    onPress={onShareLink}
                    disabled={!ready}
                  />
                </View>
              </>
            )}
            {sharedCards}
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
