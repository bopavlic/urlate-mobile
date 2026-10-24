import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Share, Text } from 'react-native';

import { apiErrorCode } from '@/api/client';
import { createInvite } from '@/api/generated/endpoints/invites/invites';
import { useGetLedger } from '@/api/generated/endpoints/ledgers/ledgers';
import { inviteErrorMessage, shareMessage } from '@/features/invites/copy';
import { InviteScreen } from '@/features/invites/InviteScreen';
import { Screen } from '@/ui/Screen';

export default function InviteRoute() {
  const { ledgerId, memberId } = useLocalSearchParams<{ ledgerId: string; memberId?: string }>();
  const detail = useGetLedger(ledgerId);
  const ledger = detail.data;
  // undefined until picked: a pair invites its placeholder, a group defaults to an open link.
  // A group's members screen can open this for one person.
  const [picked, setPicked] = useState<string | null | undefined>(memberId);
  const target =
    picked !== undefined
      ? picked
      : ledger?.kind === 'PAIR'
        ? (ledger.members.find((member) => member.isPlaceholder)?.id ?? null)
        : null;

  // POST as a query: the API hands back the same live invite each time, so refetching is safe.
  const invite = useQuery({
    queryKey: ['invite', ledgerId, target],
    queryFn: () => createInvite(ledgerId, target ? { memberId: target } : {}),
    enabled: !!ledger,
    staleTime: 60 * 60_000,
  });

  if (!ledger) {
    return (
      <Screen className="items-center justify-center">
        {detail.isError ? (
          <Text className="text-center text-lg text-muted">
            Couldn&apos;t load this one. Check your connection.
          </Text>
        ) : (
          <ActivityIndicator />
        )}
      </Screen>
    );
  }

  return (
    <InviteScreen
      ledger={ledger}
      target={target}
      onTargetChange={setPicked}
      invite={invite.data}
      errorMessage={invite.isError ? inviteErrorMessage(apiErrorCode(invite.error)) : null}
      onRetry={() => void invite.refetch()}
      onShare={() => {
        if (!invite.data) return;
        void Share.share({ message: shareMessage(invite.data, ledger) });
      }}
    />
  );
}
