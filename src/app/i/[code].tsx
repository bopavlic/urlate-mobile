import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { apiErrorCode, apiErrorDetails } from '@/api/client';
import { useClaimInvite, useGetInvitePreview } from '@/api/generated/endpoints/invites/invites';
import { inviteErrorMessage } from '@/features/invites/copy';
import { normalizeInviteCode } from '@/features/invites/invite-code';
import { JoinScreen } from '@/features/invites/JoinScreen';
import { savePendingInvite } from '@/features/invites/pending';
import { refreshLedgers } from '@/features/ledgers/queries';
import { authClient } from '@/lib/auth';

/** urlate.app/i/{code} and urlate://i/{code} land here, signed in or not. */
export default function JoinRoute() {
  const params = useLocalSearchParams<{ code: string }>();
  const code = normalizeInviteCode(params.code ?? '');
  const { data: session } = authClient.useSession();
  const preview = useGetInvitePreview(code ?? '', { query: { enabled: !!code } });
  const claim = useClaimInvite();
  const [joinError, setJoinError] = useState<string | null>(null);

  async function join() {
    if (!code) return;
    setJoinError(null);
    try {
      const ledger = await claim.mutateAsync({ code });
      await refreshLedgers();
      router.replace(`/ledgers/${ledger.id}`);
    } catch (error) {
      const ledgerId = apiErrorDetails(error)?.ledgerId;
      if (apiErrorCode(error) === 'ALREADY_MEMBER' && typeof ledgerId === 'string') {
        router.replace(`/ledgers/${ledgerId}`);
        return;
      }
      setJoinError(inviteErrorMessage(apiErrorCode(error)));
    }
  }

  async function signInFirst() {
    if (code) await savePendingInvite(code);
    router.replace('/sign-in');
  }

  const loadError = !code
    ? inviteErrorMessage('INVITE_NOT_FOUND')
    : preview.isError
      ? inviteErrorMessage(apiErrorCode(preview.error))
      : null;

  return (
    <JoinScreen
      code={code ?? params.code ?? ''}
      preview={preview.data}
      errorMessage={loadError ?? joinError}
      signedIn={!!session}
      joining={claim.isPending}
      onJoin={() => void join()}
      onSignIn={() => void signInFirst()}
    />
  );
}
