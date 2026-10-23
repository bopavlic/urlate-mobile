import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';

import { isValidEmail } from '@/features/auth/email';
import {
  appleAvailable,
  googleEnabled,
  signInWithApple,
  signInWithGoogle,
} from '@/features/auth/social';
import { authClient } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';
import { Title } from '@/ui/Title';

export default function SignIn() {
  const scheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showApple, setShowApple] = useState(false);

  useEffect(() => {
    void appleAvailable().then(setShowApple);
  }, []);

  async function sendCode() {
    const address = email.trim().toLowerCase();
    if (!isValidEmail(address)) {
      setError('That email address looks incomplete.');
      return;
    }
    setError(null);
    setSending(true);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: address,
      type: 'sign-in',
    });
    setSending(false);
    if (sendError) {
      setError("Couldn't send the code. Check the address and your connection.");
      return;
    }
    router.push({ pathname: '/code', params: { email: address } });
  }

  async function social(run: () => Promise<unknown>) {
    setError(null);
    try {
      await run();
    } catch {
      setError("That didn't work. Try again, or use your email.");
    }
  }

  return (
    <Screen scroll className="justify-between pt-16">
      <View className="gap-4">
        <View className="h-12 w-9 -rotate-6 rounded-md bg-accent" />
        <Title className="text-6xl leading-[60px]">Who&apos;s been waiting on who?</Title>
        <Text className="text-lg text-muted">
          Ur Late keeps score of who kept whom waiting, in minutes.
        </Text>
      </View>

      <View className="mt-12 gap-4">
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={sendCode}
          error={error}
        />
        <Button title="Email me a code" onPress={sendCode} loading={sending} />

        {showApple || googleEnabled ? (
          <View className="my-2 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-line" />
            <Text className="text-muted">or</Text>
            <View className="h-px flex-1 bg-line" />
          </View>
        ) : null}

        {showApple ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={
              scheme === 'dark'
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={16}
            style={{ height: 56 }}
            onPress={() => social(signInWithApple)}
          />
        ) : null}
        {googleEnabled ? (
          <Button
            title="Continue with Google"
            variant="secondary"
            onPress={() => social(signInWithGoogle)}
          />
        ) : null}
      </View>
    </Screen>
  );
}
