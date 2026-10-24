import { useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorCode } from '@/api/client';
import type { UserPreview } from '@/api/generated/model';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/TextField';

import { normalizeUsername, usernameErrorMessage } from './copy';

type State =
  { step: 'typing' } | { step: 'found'; user: UserPreview } | { step: 'sent'; user: UserPreview };

/** Someone already on Ur Late: look them up by username, then send them the invite. */
export function SendToUsername({
  onFind,
  onSend,
}: {
  onFind: (username: string) => Promise<UserPreview>;
  onSend: (username: string) => Promise<unknown>;
}) {
  const [text, setText] = useState('');
  const [state, setState] = useState<State>({ step: 'typing' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function attempt(username: string, action: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(usernameErrorMessage(apiErrorCode(err), username));
    } finally {
      setBusy(false);
    }
  }

  function find() {
    const username = normalizeUsername(text);
    if (!username) {
      setError('Usernames are 3–20 letters, digits or underscores.');
      return;
    }
    void attempt(username, async () => setState({ step: 'found', user: await onFind(username) }));
  }

  return (
    <View className="gap-3">
      <TextField
        label="Username"
        hint="Already on Ur Late? Send it straight to them."
        error={error}
        value={text}
        onChangeText={(value) => {
          setText(value);
          setState({ step: 'typing' });
          setError(null);
        }}
        placeholder="@username"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={find}
      />
      {state.step === 'typing' ? (
        <Button title="Find" variant="secondary" loading={busy} onPress={find} />
      ) : (
        <View className="gap-3 rounded-2xl bg-surface p-4">
          <View className="flex-row items-center gap-3">
            <Avatar name={state.user.displayName} url={state.user.avatarUrl} size={44} />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-ink" numberOfLines={1}>
                {state.user.displayName}
              </Text>
              <Text className="text-base text-muted">@{state.user.username}</Text>
            </View>
          </View>
          {state.step === 'sent' ? (
            <Text className="text-base text-ink">
              Sent. {state.user.displayName} will get a notification.
            </Text>
          ) : (
            <Button
              title={`Send to ${state.user.displayName}`}
              loading={busy}
              onPress={() => {
                const { user } = state;
                void attempt(user.username, async () => {
                  await onSend(user.username);
                  setState({ step: 'sent', user });
                });
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}
