import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorCode } from '@/api/client';
import { useCreateLedger } from '@/api/generated/endpoints/ledgers/ledgers';
import { buildCreateLedgerBody } from '@/features/ledgers/new-ledger';
import { refreshLedgers } from '@/features/ledgers/queries';
import { groupLimitReached } from '@/features/premium/copy';
import { refreshEntitlements, useEntitlements } from '@/features/premium/queries';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Segmented } from '@/ui/Segmented';
import { TextField } from '@/ui/TextField';

export default function NewLedger() {
  const [kind, setKind] = useState<'PAIR' | 'GROUP'>('PAIR');
  const [name, setName] = useState('');
  const [people, setPeople] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateLedger();
  const entitlements = useEntitlements();
  const atGroupLimit = kind === 'GROUP' && groupLimitReached(entitlements.data);

  function setPerson(index: number, value: string) {
    setPeople((current) => current.map((person, i) => (i === index ? value : person)));
  }

  async function save() {
    const body = buildCreateLedgerBody({
      kind,
      name,
      people: kind === 'PAIR' ? people.slice(0, 1) : people,
    });
    if ('error' in body) {
      setError(body.error);
      return;
    }
    setError(null);
    try {
      const ledger = await create.mutateAsync({ data: body });
      void refreshLedgers();
      if (kind === 'GROUP') void refreshEntitlements();
      router.replace(`/ledgers/${ledger.id}`);
    } catch (err) {
      // The limit was reached since entitlements loaded (e.g. on another phone).
      if (apiErrorCode(err) === 'PREMIUM_REQUIRED') {
        void refreshEntitlements();
        return;
      }
      setError("Couldn't save. Check your connection and try again.");
    }
  }

  return (
    <Screen scroll className="gap-6">
      <ScreenHeader title="Who keeps you waiting?" />

      <Segmented
        options={[
          { value: 'PAIR', label: 'One person' },
          { value: 'GROUP', label: 'A group' },
        ]}
        value={kind}
        onChange={(next) => {
          setKind(next);
          setError(null);
        }}
      />

      {kind === 'PAIR' ? (
        <TextField
          label="Their name"
          value={people[0] ?? ''}
          onChangeText={(value) => setPerson(0, value)}
          placeholder="My brother"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={save}
        />
      ) : (
        <View className="gap-4">
          <TextField
            label="Group name"
            value={name}
            onChangeText={setName}
            placeholder="Friday lunch"
            autoFocus
          />
          {people.map((person, index) => (
            <TextField
              key={index}
              label={index === 0 ? 'People (optional)' : `Person ${index + 1}`}
              value={person}
              onChangeText={(value) => setPerson(index, value)}
              placeholder="Name"
            />
          ))}
          <Button
            title="Add person"
            variant="ghost"
            onPress={() => setPeople((current) => [...current, ''])}
          />
        </View>
      )}

      <Text className="text-base text-muted">
        {kind === 'PAIR'
          ? "They don't need the app yet. You can invite them later and they'll see the whole history."
          : "Add people now even if they're not on the app, or leave it empty and share the group's invite link."}
      </Text>
      {error ? <Text className="text-base text-danger">{error}</Text> : null}
      {atGroupLimit ? (
        <View className="gap-3 rounded-2xl bg-surface p-5">
          <Text className="text-base text-ink">
            You&apos;ve started two groups, the most a free account can. Premium has no limit, and
            joining other people&apos;s groups is always free.
          </Text>
          <Button title="See Premium" onPress={() => router.push('/premium')} />
        </View>
      ) : (
        <Button title="Save" onPress={save} loading={create.isPending} />
      )}
    </Screen>
  );
}
