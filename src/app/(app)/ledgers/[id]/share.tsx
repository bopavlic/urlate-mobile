import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share } from 'react-native';

import {
  createShareCard,
  deleteShareCard,
  listShareCards,
} from '@/api/generated/endpoints/share-cards/share-cards';
import { useWatchAd } from '@/features/ads/useWatchAd';
import { useEntitlements } from '@/features/premium/queries';
import { shareLinkMessage } from '@/features/share/copy';
import { FREE_LOOK, isFreeLook, type Look } from '@/features/share/look';
import { shareCardImage } from '@/features/share/share-image';
import { SharedCards } from '@/features/share/SharedCards';
import { ShareScreen } from '@/features/share/ShareScreen';
import { queryClient } from '@/providers/query';

export default function ShareRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [look, setLook] = useState<Look>(FREE_LOOK);
  const entitlements = useEntitlements();
  const ad = useWatchAd('SHARE_STYLES');
  const lookLocked = !isFreeLook(look) && !entitlements.data?.features.shareStyles;

  // POST as a query: the API hands back the same card while the minutes and look are unchanged,
  // and a fresh one after either moved. The last card stays on screen while the next loads.
  const card = useQuery({
    queryKey: ['share-card', id, look.style, look.cardColor],
    queryFn: () => createShareCard(id, look),
    enabled: !lookLocked,
    placeholderData: keepPreviousData,
    gcTime: 0,
  });
  // Keyed by the card on screen: making a new card adds it to the list.
  const shared = useQuery({
    queryKey: ['share-cards', id, card.data?.id],
    queryFn: () => listShareCards(id),
    enabled: !!card.data,
    placeholderData: keepPreviousData,
  });

  async function takeDown(cardId: string) {
    await deleteShareCard(cardId);
    // The card on screen was taken down: the next share makes a new link.
    if (cardId === card.data?.id) queryClient.removeQueries({ queryKey: ['share-card', id] });
    await queryClient.invalidateQueries({ queryKey: ['share-cards', id] });
    if (cardId === card.data?.id) await card.refetch();
  }

  return (
    <ShareScreen
      card={card.data}
      errorMessage={
        card.isError ? 'Couldn’t make the card. Check your connection and try again.' : null
      }
      onRetry={() => void card.refetch()}
      onShareImage={(view) => shareCardImage(view, card.data?.headline ?? 'Ur Late')}
      onShareLink={() => {
        if (card.data) void Share.share({ message: shareLinkMessage(card.data) });
      }}
      look={look}
      onLookChange={setLook}
      lookLocked={lookLocked}
      onGetPremium={() => router.push('/premium')}
      adOffer={ad.offer}
      adState={ad.state}
      onWatchAd={() => void ad.watch()}
      sharedCards={
        <SharedCards
          cards={shared.data?.items ?? []}
          currentId={card.data?.id ?? null}
          onTakeDown={takeDown}
        />
      }
    />
  );
}
