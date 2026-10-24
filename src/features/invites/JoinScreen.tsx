import { ActivityIndicator, Text, View } from 'react-native';

import type { InvitePreview } from '@/api/generated/model';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Title } from '@/ui/Title';

import { inviteBalanceLine, inviteTitle, joinButtonTitle } from './copy';
import { formatInviteCode } from './invite-code';

/** Before joining: who invited you and the balance you'd take over. */
export function JoinScreen({
  code,
  preview,
  errorMessage,
  signedIn,
  joining,
  onJoin,
  onSignIn,
}: {
  code: string;
  preview: InvitePreview | undefined;
  errorMessage: string | null;
  signedIn: boolean;
  joining: boolean;
  onJoin: () => void;
  onSignIn: () => void;
}) {
  if (!preview) {
    return (
      <Screen scroll>
        <View className="gap-6">
          <ScreenHeader title="Invite" />
          <Text className="font-display text-3xl tracking-wider text-muted">
            {formatInviteCode(code)}
          </Text>
          {errorMessage ? (
            <Text className="text-lg text-ink">{errorMessage}</Text>
          ) : (
            <ActivityIndicator className="mt-8" />
          )}
        </View>
      </Screen>
    );
  }

  const balance = inviteBalanceLine(preview);
  return (
    <Screen scroll>
      <View className="flex-1 gap-8">
        <View className="gap-6 pt-12">
          <Avatar name={preview.inviterName} url={preview.inviterAvatarUrl} size={72} />
          <Title>{inviteTitle(preview)}</Title>
          {balance ? (
            <View className="self-start rounded-full bg-accent px-5 py-2.5">
              <Text className="font-display-bold text-xl text-on-accent">{balance}</Text>
            </View>
          ) : null}
          {preview.kind === 'PERSON' ? (
            <Text className="text-lg text-muted">
              Every minute either of you keeps the other waiting counts.
            </Text>
          ) : null}
          {preview.placeholderName ? (
            <Text className="text-lg text-muted">
              They’ve been calling you “{preview.placeholderName}”.
            </Text>
          ) : null}
        </View>

        <View className="mt-auto gap-3">
          {errorMessage ? <Text className="text-base text-danger">{errorMessage}</Text> : null}
          {signedIn ? (
            <Button title={joinButtonTitle(preview)} onPress={onJoin} loading={joining} />
          ) : (
            <Button
              title={preview.kind === 'PERSON' ? 'Sign in to start' : 'Sign in to join'}
              onPress={onSignIn}
            />
          )}
          <Text className="text-center text-sm text-muted">
            Code {formatInviteCode(preview.code)}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
