import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share } from 'react-native';

import { createShareCard } from '@/api/generated/endpoints/share-cards/share-cards';
import { useWatchAd } from '@/features/ads/useWatchAd';
import { useEntitlements } from '@/features/premium/queries';
import { shareLinkMessage } from '@/features/share/copy';
import { FREE_LOOK, isFreeLook, type Look } from '@/features/share/look';
import { shareCardImage } from '@/features/share/share-image';
import { ShareScreen } from '@/features/share/ShareScreen';

export default function ShareRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [look, setLook] = useState<Look>(FREE_LOOK);
  const entitlements = useEntitlements();
  const ad = useWatchAd('SHARE_STYLES');
  const lookLocked = !isFreeLook(look) && !entitlements.data?.features.shareStyles;

  // POST as a query: the API hands back the same card while the score and look are unchanged,
  // and a fresh one after either moved. The last card stays on screen while the next loads.
  const card = useQuery({
    queryKey: ['share-card', id, look.style, look.cardColor],
    queryFn: () => createShareCard(id, look),
    enabled: !lookLocked,
    placeholderData: keepPreviousData,
    gcTime: 0,
  });

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
    />
  );
}
