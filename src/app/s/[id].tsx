import { router, useLocalSearchParams } from 'expo-router';

import { apiErrorCode } from '@/api/client';
import { useGetShareCard } from '@/api/generated/endpoints/share-cards/share-cards';
import { normalizeShareCardId } from '@/features/share/copy';
import { SharedCardScreen } from '@/features/share/SharedCardScreen';

const GONE = 'This card isn’t here any more. The link may be mistyped, or the card was taken down.';

/** urlate.app/s/{id} and urlate://s/{id} land here, signed in or not. */
export default function SharedCardRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = normalizeShareCardId(params.id ?? '');
  const card = useGetShareCard(id ?? '', { query: { enabled: !!id } });

  const errorMessage = !id
    ? GONE
    : card.isError
      ? apiErrorCode(card.error) === 'SHARE_CARD_NOT_FOUND'
        ? GONE
        : 'Couldn’t reach Ur Late. Check your connection and try again.'
      : null;

  // Home, or sign-in for someone who isn't signed in yet (the root layout's guards decide).
  const openApp = () => router.replace('/');
  return (
    <SharedCardScreen
      card={card.data}
      errorMessage={errorMessage}
      onBack={() => (router.canGoBack() ? router.back() : openApp())}
      onOpenApp={openApp}
    />
  );
}
