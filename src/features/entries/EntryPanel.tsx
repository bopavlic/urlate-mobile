import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  useConfirmEntry,
  useDeleteEntry,
  useDisputeEntry,
  useListEntryRevisions,
  useRejectEntry,
} from '@/api/generated/endpoints/entries/entries';
import type { Entry, EntryRevision } from '@/api/generated/model';
import { refreshActivity } from '@/features/activity/queries';
import { refreshLedgers } from '@/features/ledgers/queries';
import { formatWhen } from '@/features/ledgers/when';

import { EntryActionsBar } from './EntryActionsBar';

function Revision({ revision }: { revision: EntryRevision }) {
  return (
    <View className="gap-0.5">
      <Text className="text-base text-ink">
        {revision.minutes} min{revision.note ? `, “${revision.note}”` : ''},{' '}
        {formatWhen(new Date(revision.occurredAt))}
      </Text>
      <Text className="text-sm text-muted">Changed {formatWhen(new Date(revision.changedAt))}</Text>
    </View>
  );
}

/** Earlier versions: edits are never quiet, so anyone in the ledger can read them. */
function Revisions({ entryId }: { entryId: string }) {
  const revisions = useListEntryRevisions(entryId);
  if (revisions.isPending) return <ActivityIndicator />;
  const items = revisions.data?.items ?? [];
  if (items.length === 0) return null;
  return (
    <View className="gap-3 rounded-2xl border-2 border-line p-4">
      <Text className="font-semibold text-ink">Before it was edited</Text>
      {/* Newest first, like the history above it. */}
      {[...items].reverse().map((revision) => (
        <Revision key={revision.changedAt} revision={revision} />
      ))}
    </View>
  );
}

export function EntryPanel({ entry }: { entry: Entry }) {
  const confirm = useConfirmEntry();
  const reject = useRejectEntry();
  const dispute = useDisputeEntry();
  const remove = useDeleteEntry();
  const [error, setError] = useState<string | null>(null);
  const busy = confirm.isPending || reject.isPending || dispute.isPending || remove.isPending;

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await Promise.all([refreshLedgers(), refreshActivity()]);
    } catch {
      // Someone else may have changed it meanwhile; the refreshed entry shows what's possible now.
      setError("Couldn't save that. Check your connection and try again.");
      void refreshLedgers();
    }
  }

  return (
    <View className="gap-4">
      <EntryActionsBar
        entry={entry}
        busy={busy}
        onConfirm={() => void run(() => confirm.mutateAsync({ id: entry.id }))}
        onReject={() => void run(() => reject.mutateAsync({ id: entry.id }))}
        onDispute={() => void run(() => dispute.mutateAsync({ id: entry.id }))}
        onDelete={() => void run(() => remove.mutateAsync({ id: entry.id }))}
        onEdit={() => router.push({ pathname: '/entries/[id]/edit', params: { id: entry.id } })}
      />
      {error ? <Text className="text-base text-danger">{error}</Text> : null}
      {entry.editedAt ? <Revisions entryId={entry.id} /> : null}
    </View>
  );
}
