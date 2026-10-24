import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Entry, UpdateEntryBody } from '@/api/generated/model';
import { MinutePicker } from '@/features/log/MinutePicker';
import { WhenPicker } from '@/features/log/WhenPicker';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';

import { initialEditState, toUpdateEntryBody, type EditState } from './edit-form';

const clamp = (minutes: number) => Math.min(1440, Math.max(1, minutes));

/** Who was late stays fixed: changing that would be a different entry. */
export function EditEntryScreen({
  entry,
  lateName,
  lateIsMe = false,
  onSave,
}: {
  entry: Entry;
  lateName: string;
  lateIsMe?: boolean;
  onSave: (body: UpdateEntryBody) => Promise<void>;
}) {
  const [state, setState] = useState<EditState>(() => initialEditState(entry));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const body = toUpdateEntryBody(entry, state);

  async function save() {
    if (!body) return;
    setError(null);
    setSaving(true);
    try {
      await onSave(body);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="gap-8 px-6 pb-8" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={lateIsMe ? 'You were late' : `${lateName} was late`} />
        <View className="gap-4">
          <Text className="text-lg font-semibold text-ink">How late?</Text>
          <MinutePicker
            value={state.minutes}
            onChange={(minutes) => setState((s) => ({ ...s, minutes: clamp(minutes) }))}
            onStep={(delta) => setState((s) => ({ ...s, minutes: clamp(s.minutes + delta) }))}
          />
        </View>
        <TextField
          label="Note (optional)"
          value={state.note}
          onChangeText={(note) => setState((s) => ({ ...s, note }))}
          placeholder="dinner"
          maxLength={140}
        />
        <WhenPicker
          value={state.occurredAt}
          onChange={(occurredAt) =>
            setState((s) => ({ ...s, occurredAt: occurredAt ?? new Date() }))
          }
        />
        <Text className="text-base text-muted">
          Everyone involved is told about the change, and the old version stays in its history.
        </Text>
      </ScrollView>
      <View className="gap-2 border-t border-line bg-paper px-6 pb-2 pt-3">
        {error ? <Text className="text-base text-danger">{error}</Text> : null}
        <Button title="Save changes" onPress={save} disabled={!body} loading={saving} />
      </View>
    </Screen>
  );
}
