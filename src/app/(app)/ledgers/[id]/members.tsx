import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';

import { apiErrorCode } from '@/api/client';
import {
  getGetLedgerQueryKey,
  leaveLedger,
  useAddMember,
  useGetLedger,
  useRemoveMember,
  useRenameMember,
} from '@/api/generated/endpoints/ledgers/ledgers';
import { blockPerson, getListBlocksQueryKey } from '@/api/generated/endpoints/safety/safety';
import { MembersScreen } from '@/features/ledgers/MembersScreen';
import { refreshLedgers } from '@/features/ledgers/queries';
import { queryClient } from '@/providers/query';
import { Screen } from '@/ui/Screen';

export default function MembersRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useGetLedger(id);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const renameMember = useRenameMember();

  if (!detail.data) {
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

  // MembersScreen words its errors from the API's code.
  const withCode = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (err) {
      throw { code: apiErrorCode(err) };
    }
    await refreshLedgers();
  };

  return (
    <MembersScreen
      detail={detail.data}
      onAdd={(placeholderName) =>
        withCode(() => addMember.mutateAsync({ id, data: { placeholderName } }))
      }
      onRemove={(memberId) => withCode(() => removeMember.mutateAsync({ id, memberId }))}
      onRename={(memberId, placeholderName) =>
        withCode(() => renameMember.mutateAsync({ id, memberId, data: { placeholderName } }))
      }
      onLeave={async () => {
        await leaveLedger(id);
        // Home first: the ledger screens under this one would 404 on their next refetch.
        router.dismissTo('/');
        queryClient.removeQueries({ queryKey: getGetLedgerQueryKey(id) });
        await refreshLedgers();
      }}
      onReport={(member) =>
        router.push({
          pathname: '/report',
          params: { memberId: member.id, name: member.displayName },
        })
      }
      onBlock={async (member) => {
        await blockPerson({ memberId: member.id });
        void queryClient.invalidateQueries({ queryKey: getListBlocksQueryKey() });
        if (detail.data.kind === 'PAIR') {
          // Blocking ended this pair: same way out as leaving.
          router.dismissTo('/');
          queryClient.removeQueries({ queryKey: getGetLedgerQueryKey(id) });
        }
        await refreshLedgers();
      }}
      onInvite={(memberId) =>
        router.push({
          pathname: '/invite',
          params: memberId ? { ledgerId: id, memberId } : { ledgerId: id },
        })
      }
    />
  );
}
