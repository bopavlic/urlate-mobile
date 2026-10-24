import { ActivityIndicator, Alert, Text, View } from 'react-native';

import type { PersonalInvite } from '@/api/generated/model';
import { Button } from '@/ui/Button';
import { QrCode } from '@/ui/QrCode';

import { formatInviteCode } from './invite-code';

/**
 * The QR on the profile, for in person: whoever scans it is added with you. It
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
      <Text className="font-display text-lg text-ink">Add me on Ur Late</Text>
      <Text className="text-base text-muted">
        Anyone who scans this can start counting your minutes with you.
        {username ? ` Or they can find you as @${username}.` : ''}
      </Text>
      {invite ? (
        <View className="items-center gap-4">
          <QrCode
            value={invite.url}
            size={200}
            accessibilityLabel="QR code to add you on Ur Late"
          />
          <Text selectable className="font-display text-3xl tracking-wider text-ink">
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
                'Your current QR code and link stop working. People you already added stay.',
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
