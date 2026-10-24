import { Alert, Text, View } from 'react-native';

import type { Entry } from '@/api/generated/model';
import { Button } from '@/ui/Button';

import { disputeHint } from './status';

/** The buttons come from `entry.actions`: the API decides who may do what. */
export function EntryActionsBar({
  entry,
  busy,
  onConfirm,
  onReject,
  onDispute,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  busy: boolean;
  onConfirm: () => void;
  onReject: () => void;
  onDispute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { actions } = entry;
  const hint = actions.dispute ? disputeHint(entry.disputableUntil) : null;
  const nothing = !Object.values(actions).some(Boolean);

  const ask = (title: string, message: string, action: string, onYes: () => void) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: action, style: 'destructive', onPress: onYes },
    ]);

  if (nothing) {
    return <Text className="text-sm text-muted">Only whoever logged this can change it.</Text>;
  }

  return (
    <View className="gap-3">
      {actions.confirm || actions.reject ? (
        <View className="flex-row gap-3">
          {actions.confirm ? (
            <Button
              title={entry.status === 'DISPUTED' ? 'Accept after all' : 'Accept'}
              className="flex-1"
              disabled={busy}
              onPress={onConfirm}
            />
          ) : null}
          {actions.reject ? (
            <Button
              title="Reject"
              variant="secondary"
              className="flex-1"
              disabled={busy}
              onPress={() =>
                ask(
                  'Reject this?',
                  "It won't count. Whoever logged it can change it and ask again.",
                  'Reject',
                  onReject,
                )
              }
            />
          ) : null}
        </View>
      ) : null}

      {actions.dispute ? (
        <View className="gap-1">
          <Button
            title="Dispute"
            variant="secondary"
            disabled={busy}
            onPress={() =>
              ask(
                'Dispute this?',
                'It stops counting until you accept it or it gets changed.',
                'Dispute',
                onDispute,
              )
            }
          />
          {hint ? <Text className="text-sm text-muted">{hint}</Text> : null}
        </View>
      ) : null}

      {actions.edit || actions.delete ? (
        <View className="flex-row gap-3">
          {actions.edit ? (
            <Button
              title="Edit"
              variant="secondary"
              className="flex-1"
              disabled={busy}
              onPress={onEdit}
            />
          ) : null}
          {actions.delete ? (
            <Button
              title="Delete"
              variant="danger"
              className="flex-1"
              disabled={busy}
              onPress={() =>
                ask(
                  'Delete this entry?',
                  'It stops counting. Everyone in it is told, and it stays in history as deleted.',
                  'Delete',
                  onDelete,
                )
              }
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
