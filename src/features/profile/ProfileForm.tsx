import { useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorCode } from '@/api/client';
import { getGetMeQueryKey, useUpdateMe } from '@/api/generated/endpoints/me/me';
import type { Me } from '@/api/generated/model';
import { queryClient } from '@/providers/query';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/TextField';

export function ProfileForm({ me }: { me: Me }) {
  const [displayName, setDisplayName] = useState(me.displayName);
  const [username, setUsername] = useState(me.username ?? '');
  const [errors, setErrors] = useState<{ name?: string; username?: string; form?: string }>({});
  const [saved, setSaved] = useState(false);
  const update = useUpdateMe();

  const nameChanged = displayName.trim() !== me.displayName;
  const usernameChanged = username.trim().toLowerCase() !== (me.username ?? '');

  async function save() {
    if (!displayName.trim()) {
      setErrors({ name: 'Add the name your friends know you by.' });
      return;
    }
    setErrors({});
    setSaved(false);
    try {
      const updated = await update.mutateAsync({
        data: {
          ...(nameChanged ? { displayName: displayName.trim() } : {}),
          ...(usernameChanged && username.trim() ? { username: username.trim() } : {}),
        },
      });
      queryClient.setQueryData(getGetMeQueryKey(), updated);
      setUsername(updated.username ?? '');
      setSaved(true);
    } catch (err) {
      const code = apiErrorCode(err);
      if (code === 'USERNAME_TAKEN') setErrors({ username: 'That username is taken.' });
      else if (code === 'VALIDATION_ERROR')
        setErrors({ username: '3–20 letters, numbers or underscores.' });
      else setErrors({ form: "Couldn't save. Check your connection and try again." });
    }
  }

  return (
    <View className="gap-4">
      <TextField
        label="Your name"
        value={displayName}
        onChangeText={(value) => {
          setDisplayName(value);
          setSaved(false);
        }}
        autoComplete="name"
        error={errors.name}
      />
      <TextField
        label="Username"
        value={username}
        onChangeText={(value) => {
          setUsername(value);
          setSaved(false);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="borna"
        hint="So friends can find you."
        error={errors.username}
      />
      {errors.form ? <Text className="text-base text-danger">{errors.form}</Text> : null}
      <Button
        title={saved ? 'Saved' : 'Save changes'}
        variant="secondary"
        onPress={save}
        disabled={!nameChanged && !(usernameChanged && username.trim())}
        loading={update.isPending}
      />
    </View>
  );
}
