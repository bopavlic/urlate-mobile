import { ActivityIndicator, Alert, Text, View } from 'react-native';

import type { PersonalInvite } from '@/api/generated/model';
import { Button } from '@/ui/Button';
import { QrCode } from '@/ui/QrCode';

import { formatInviteCode } from './invite-code';

/**
 * The QR on the profile, for in person: whoever scans it starts a tally with you. It
 * works until you make a new one, so it can be screenshotted and reused.
 */
export function MyInviteCode({
  invite,
  username,
  onShare,
  onReset,
  resetting = false,
}: {
  invite: PersonalInvite | undefined;
  username: string | null;
  onShare: () => void;
  onReset: () => void;
  resetting?: boolean;
}) {
  return (
    <View className="gap-4">
      <Text className="font-display-bold text-2xl text-ink">Keep score with me</Text>
      <Text className="text-base text-muted">
        Anyone who scans this starts a tally with you.
        {username ? ` Or they can find you as @${username}.` : ''}
      </Text>
      {invite ? (
        <View className="items-center gap-4">
          <QrCode
            value={invite.url}
            size={200}
            accessibilityLabel="QR code to start keeping score with you"
          />
          <Text selectable className="font-display text-4xl tracking-widest text-ink">
            {formatInviteCode(invite.code)}
          </Text>
          <Button
            title="Share my link"
            variant="secondary"
            onPress={onShare}
            className="self-stretch"
          />
          <Button
            title="Make a new code"
            variant="ghost"
            loading={resetting}
            onPress={() =>
              Alert.alert(
                'Make a new code?',
                'Your current QR code and link stop working. Tallies you already started stay.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Make a new one', style: 'destructive', onPress: onReset },
                ],
              )
            }
          />
        </View>
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
}
