import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Share } from 'react-native';

import { createShareCard } from '@/api/generated/endpoints/share-cards/share-cards';
import { shareLinkMessage } from '@/features/share/copy';
import { shareCardImage } from '@/features/share/share-image';
import { ShareScreen } from '@/features/share/ShareScreen';

export default function ShareRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // POST as a query: the API hands back the same card while the score is unchanged, and a
  // fresh one each time this screen opens after it moved.
  const card = useQuery({
    queryKey: ['share-card', id],
    queryFn: () => createShareCard(id),
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
    />
  );
}
