import { useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorCode } from '@/api/client';
import { useUpdateMe } from '@/api/generated/endpoints/me/me';
import { authClient } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';
import { Title } from '@/ui/Title';

export default function Onboarding() {
  const { refetch } = authClient.useSession();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<{ name?: string; username?: string }>({});
  const updateMe = useUpdateMe();

  async function save() {
    const displayName = name.trim();
    if (!displayName) {
      setError({ name: 'Add the name your friends know you by.' });
      return;
    }
    setError({});
    try {
      await updateMe.mutateAsync({
        data: {
          displayName,
          ...(username.trim() ? { username: username.trim() } : {}),
        },
      });
      await refetch(); // the session now has a name, so the app opens
    } catch (err) {
      const code = apiErrorCode(err);
      if (code === 'USERNAME_TAKEN') setError({ username: 'That username is taken.' });
      else if (code === 'VALIDATION_ERROR')
        setError({ username: '3–20 letters, numbers or underscores.' });
      else
        setError({
          name: "Couldn't save. Check your connection and try again.",
        });
    }
  }

  return (
    <Screen scroll className="gap-6 pt-16">
      <Title>What should we call you?</Title>
      <Text className="text-lg text-muted">
        This is the name people see when you log who was late.
      </Text>
      <View className="gap-4">
        <TextField
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="Borna"
          autoComplete="name"
          textContentType="name"
          error={error.name}
        />
        <TextField
          label="Username (optional)"
          value={username}
          onChangeText={setUsername}
          placeholder="borna"
          autoCapitalize="none"
          autoCorrect={false}
          hint="So friends can find you."
          error={error.username}
        />
      </View>
      <Button title="Start tracking" onPress={save} loading={updateMe.isPending} />
    </Screen>
  );
}
