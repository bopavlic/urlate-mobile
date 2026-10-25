import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { ReportBodyReason } from '@/api/generated/model';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';

const REASONS: { value: ReportBodyReason; label: string }[] = [
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'INAPPROPRIATE', label: 'Offensive or inappropriate' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'OTHER', label: 'Something else' },
];

/** Rejections carry the API's error code. */
type ReportError = { code?: string };

/**
 * Report a person or a ticket to us. The report reaches the owner by email; the reported
 * person is never told who sent it.
 */
export function ReportScreen({
  subject,
  onSend,
  onDone,
}: {
  /** Who or what is reported: "Ana" or "this ticket". */
  subject: string;
  onSend: (reason: ReportBodyReason, details: string | undefined) => Promise<void>;
  onDone: () => void;
}) {
  const [reason, setReason] = useState<ReportBodyReason | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!reason) return;
    setError(null);
    setSending(true);
    try {
      await onSend(reason, details.trim() || undefined);
      setSent(true);
    } catch (err) {
      setError(
        (err as ReportError).code === 'TOO_MANY_REPORTS'
          ? 'That’s a lot of reports for one day. Try again tomorrow.'
          : "Couldn't send the report. Check your connection and try again.",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <Screen className="gap-6">
        <ScreenHeader title="Thanks for telling us." />
        <Text className="text-base text-ink">
          We’ll look into it. If something breaks our rules, we remove it and can suspend the
          account. Nobody is told who reported them.
        </Text>
        <Text className="text-base text-muted">
          Don’t want to hear from them again? Block them from the list of people.
        </Text>
        <Button title="Done" onPress={onDone} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="gap-6 px-6 pb-12" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={`Report ${subject}`} />
        <View className="gap-2">
          <Text className="font-display text-lg text-ink">What’s wrong?</Text>
          <View accessibilityRole="radiogroup" className="overflow-hidden rounded-2xl bg-surface">
            {REASONS.map((item, index) => {
              const selected = reason === item.value;
              return (
                <View key={item.value}>
                  {index > 0 ? <View className="ml-4 h-px bg-line" /> : null}
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected }}
                    onPress={() => setReason(item.value)}
                    className="flex-row items-center justify-between px-4 py-4 active:opacity-70"
                  >
                    <Text className="text-base text-ink">{item.label}</Text>
                    <View
                      className={`h-5 w-5 rounded-full border-2 ${
                        selected ? 'border-accent bg-accent' : 'border-line'
                      }`}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
        <TextField
          label="Anything else we should know?"
          hint="Optional."
          value={details}
          onChangeText={setDetails}
          maxLength={1000}
          multiline
          className="min-h-28 py-3"
        />
        {error ? <Text className="text-base text-danger">{error}</Text> : null}
        <Button title="Send report" onPress={send} disabled={!reason} loading={sending} />
      </ScrollView>
    </Screen>
  );
}
