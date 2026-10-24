import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { Invite, LedgerDetail, UserPreview } from '@/api/generated/model';
import { Button } from '@/ui/Button';
import { QrCode } from '@/ui/QrCode';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { formatInviteCode } from './invite-code';
import { SendToUsername } from './SendToUsername';

function TargetChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-full border-2 px-4 py-2 ${selected ? 'border-ink bg-ink' : 'border-line'}`}
    >
      <Text className={`text-base font-semibold ${selected ? 'text-paper' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Share a ledger: a link for any messenger, a QR code for in person, and the code itself
 * for someone who installs the app first. In a group, pick who the invite is for.
 */
export function InviteScreen({
  ledger,
  target,
  onTargetChange,
  invite,
  errorMessage,
  onShare,
  onRetry,
  onFindUser,
  onSendToUser,
}: {
  ledger: LedgerDetail;
  /** The placeholder being handed over; null = anyone with the link (groups only). */
  target: string | null;
  onTargetChange: (memberId: string | null) => void;
  invite: Invite | undefined;
  errorMessage: string | null;
  onShare: () => void;
  onRetry: () => void;
  onFindUser: (username: string) => Promise<UserPreview>;
  /** Sends this invite (for the current target) to someone on Ur Late. */
  onSendToUser: (username: string) => Promise<unknown>;
}) {
  const placeholders = ledger.members.filter((member) => member.isPlaceholder);
  const targetName = placeholders.find((member) => member.id === target)?.displayName;
  const title =
    ledger.kind === 'GROUP'
      ? `Invite to ${ledger.name ?? 'the group'}`
      : `Invite ${targetName ?? 'them'}`;
  const explainer =
    target === null
      ? 'Anyone with this link joins the group.'
      : `When ${targetName ? `${targetName} joins` : 'they join'}, the score and its history become theirs too.`;

  return (
    <Screen scroll>
      <View className="gap-6">
        <ScreenHeader title={title} />

        {ledger.kind === 'GROUP' ? (
          <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
            <TargetChip
              label="Anyone with the link"
              selected={target === null}
              onPress={() => onTargetChange(null)}
            />
            {placeholders.map((member) => (
              <TargetChip
                key={member.id}
                label={member.displayName}
                selected={target === member.id}
                onPress={() => onTargetChange(member.id)}
              />
            ))}
          </View>
        ) : null}

        <Text className="text-base text-muted">{explainer}</Text>

        {invite ? (
          <View className="items-center gap-6">
            <QrCode
              value={invite.url}
              size={240}
              accessibilityLabel="QR code for the invite link"
            />
            <View className="items-center gap-1">
              <Text className="text-sm text-muted">Or enter this code in the app</Text>
              <Text selectable className="font-display text-5xl tracking-widest text-ink">
                {formatInviteCode(invite.code)}
              </Text>
            </View>
            <Button title="Share invite link" onPress={onShare} className="self-stretch" />
            <View className="self-stretch">
              <SendToUsername key={target ?? 'open'} onFind={onFindUser} onSend={onSendToUser} />
            </View>
          </View>
        ) : errorMessage ? (
          <View className="items-center gap-4 pt-8">
            <Text className="text-center text-lg text-danger">{errorMessage}</Text>
            <Button title="Try again" variant="secondary" onPress={onRetry} />
          </View>
        ) : (
          <ActivityIndicator className="mt-16" />
        )}
      </View>
    </Screen>
  );
}
