import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';

import { useGetEntry, useUpdateEntry } from '@/api/generated/endpoints/entries/entries';
import { useGetLedger } from '@/api/generated/endpoints/ledgers/ledgers';
import { refreshActivity } from '@/features/activity/queries';
import { EditEntryScreen } from '@/features/entries/EditEntryScreen';
import { refreshLedgers } from '@/features/ledgers/queries';
import { Screen } from '@/ui/Screen';

export default function EditEntryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useGetEntry(id);
  const ledger = useGetLedger(entry.data?.ledgerId ?? '', {
    query: { enabled: !!entry.data },
  });
  const update = useUpdateEntry();

  if (!entry.data || !ledger.data) {
    return (
      <Screen className="items-center justify-center">
        {entry.isError || ledger.isError ? (
          <Text className="text-center text-lg text-muted">
            Couldn&apos;t load this entry. Check your connection.
          </Text>
        ) : (
          <ActivityIndicator />
        )}
      </Screen>
    );
  }

  const late = ledger.data.members.find((member) => member.id === entry.data.lateMemberId);
  return (
    <EditEntryScreen
      entry={entry.data}
      lateName={late?.displayName || 'Someone'}
      lateIsMe={!!late?.isMe}
      onSave={async (data) => {
        await update.mutateAsync({ id, data });
        await Promise.all([refreshLedgers(), refreshActivity()]);
        router.back();
      }}
    />
  );
}
