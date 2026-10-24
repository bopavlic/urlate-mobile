import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { normalizeInviteCode } from '@/features/invites/invite-code';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';

/** For people who installed the app from an invite page: type the code shown there. */
export default function EnterInviteCode() {
  const [text, setText] = useState('');
  const code = normalizeInviteCode(text);
  const open = () => {
    if (code) router.push(`/i/${code}`);
  };

  return (
    <Screen scroll>
      <View className="gap-6">
        <ScreenHeader title="Enter invite code" />
        <TextField
          label="Invite code"
          hint="8 letters and numbers, like ABCD-EFGH"
          value={text}
          onChangeText={setText}
          onSubmitEditing={open}
          autoFocus
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={11}
          returnKeyType="go"
          className="font-display text-2xl tracking-wider"
        />
        <Button title="Next" onPress={open} disabled={!code} />
      </View>
    </Screen>
  );
}
