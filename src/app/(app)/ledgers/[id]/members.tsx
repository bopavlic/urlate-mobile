import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';

import { apiErrorCode } from '@/api/client';
import {
  useAddMember,
  useGetLedger,
  useRemoveMember,
} from '@/api/generated/endpoints/ledgers/ledgers';
import { MembersScreen } from '@/features/ledgers/MembersScreen';
import { refreshLedgers } from '@/features/ledgers/queries';
import { Screen } from '@/ui/Screen';

export default function MembersRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useGetLedger(id);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  if (!detail.data) {
    return (
      <Screen className="items-center justify-center">
        {detail.isError ? (
          <Text className="text-center text-lg text-muted">
            Couldn&apos;t load this group. Check your connection.
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
      onInvite={(memberId) =>
        router.push({
          pathname: '/invite',
          params: memberId ? { ledgerId: id, memberId } : { ledgerId: id },
        })
      }
    />
  );
}
