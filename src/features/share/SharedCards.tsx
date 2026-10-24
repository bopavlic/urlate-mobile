import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import type { LedgerShareCard } from '@/api/generated/model';
import { Button } from '@/ui/Button';

export function sharedByLine(
  card: Pick<LedgerShareCard, 'sharedByMe' | 'sharedByName' | 'createdAt'>,
) {
  const day = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(card.createdAt));
  // "Made", not "shared": opening this screen makes the card before anyone posts it.
  return `Made by ${card.sharedByMe ? 'you' : card.sharedByName} on ${day}`;
}

/**
 * Every link to this ledger's cards that still works. Anyone in the ledger can take one
 * down, since the card shows their name too.
 */
export function SharedCards({
  cards,
  currentId,
  onTakeDown,
}: {
  cards: LedgerShareCard[];
  /** The card shown above, if it is one of these. */
  currentId: string | null;
  onTakeDown: (id: string) => Promise<unknown>;
}) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (cards.length === 0) return null;

  function confirm(card: LedgerShareCard) {
    Alert.alert(
      'Take this card down?',
      'Its link stops working for everyone. Images already posted stay wherever they were posted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take down',
          style: 'destructive',
          onPress: () => {
            setError(null);
            setRemoving(card.id);
            onTakeDown(card.id)
              .catch(() => setError("Couldn't take it down. Check your connection and try again."))
              .finally(() => setRemoving(null));
          },
        },
      ],
    );
  }

  return (
    <View className="gap-3">
      <Text className="font-display text-lg text-ink">Links that work</Text>
      {error ? <Text className="text-base text-danger">{error}</Text> : null}
      {cards.map((card, index) => (
        <View key={card.id}>
          {index > 0 ? <View className="h-px bg-line" /> : null}
          <View className="flex-row items-center gap-3 py-3">
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-semibold text-ink" numberOfLines={2}>
                {card.headline}
              </Text>
              <Text className="text-sm text-muted">
                {card.id === currentId
                  ? 'The card above. Taking it down gives it a new link.'
                  : sharedByLine(card)}
              </Text>
            </View>
            <Button
              title="Take down"
              variant="ghost"
              accessibilityLabel={`Take down: ${card.headline}`}
              loading={removing === card.id}
              onPress={() => confirm(card)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
