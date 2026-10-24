import { useState } from 'react';
import { Alert } from 'react-native';

import { MenuRow } from '@/ui/MenuList';

// Both app stores require deleting the account from inside the app. Same rules as the
// website's /delete-account page (see urlate-backend/src/domain/account-deletion.ts).
const EXPLAINER =
  'Your profile and everything only you can see are deleted. Where people with an account are involved, you become a placeholder again so their entries and history stay. This can’t be undone.';

export function DeleteAccount({
  onDelete,
  subscribedIn,
}: {
  onDelete: () => Promise<unknown>;
  /** The store a running Premium subscription is billed through, e.g. "the App Store". */
  subscribedIn?: string | null;
}) {
  const explainer = subscribedIn
    ? `${EXPLAINER}\n\nDeleting your account doesn’t cancel Premium: cancel it in ${subscribedIn}.`
    : EXPLAINER;
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setError("Couldn't delete your account. Check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <MenuRow
      title="Delete account"
      tone="danger"
      loading={deleting}
      error={error}
      onPress={() =>
        Alert.alert('Delete your account?', explainer, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => void remove() },
        ])
      }
    />
  );
}
