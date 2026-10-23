import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CodeInput } from '@/features/auth/code-input';
import { authClient } from '@/lib/auth';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

export default function Code() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Reached without an address (e.g. a restored route): start over.
  if (!email) return <Redirect href="/sign-in" />;

  async function verify(otp: string) {
    setError(null);
    setChecking(true);
    const { error: signInError } = await authClient.signIn.emailOtp({
      email,
      otp,
    });
    setChecking(false);
    if (signInError) {
      setError("That code didn't work. Try again?");
      setAttempt((n) => n + 1); // fresh, empty boxes
    }
    // On success the root layout sees the session and moves on.
  }

  async function resend() {
    setError(null);
    await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
    setResent(true);
  }

  return (
    <Screen scroll className="gap-6">
      <ScreenHeader title="Check your inbox" />
      <Text className="text-lg text-muted">
        We sent a 6-digit code to <Text className="font-semibold text-ink">{email}</Text>.
      </Text>
      <CodeInput key={attempt} onComplete={verify} disabled={checking} />
      {error ? <Text className="text-base text-danger">{error}</Text> : null}
      <View className="mt-4 gap-2">
        <Button
          title={resent ? 'New code sent' : 'Send a new code'}
          variant="ghost"
          onPress={resend}
          disabled={resent}
        />
      </View>
    </Screen>
  );
}
