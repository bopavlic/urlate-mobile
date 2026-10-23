import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useCreateLedger } from '@/api/generated/endpoints/ledgers/ledgers';
import { buildCreateLedgerBody } from '@/features/ledgers/new-ledger';
import { refreshLedgers } from '@/features/ledgers/queries';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { TextField } from '@/ui/TextField';
import { Title } from '@/ui/Title';

export default function NewLedger() {
  const [kind, setKind] = useState<'PAIR' | 'GROUP'>('PAIR');
  const [name, setName] = useState('');
  const [people, setPeople] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateLedger();

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
      router.replace(`/ledgers/${ledger.id}`);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    }
  }

  return (
    <Screen scroll className="gap-6 pt-6">
      <View className="flex-row items-center justify-between">
        <Title className="text-4xl leading-[44px]">Keep score with…</Title>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <Text className="text-base font-semibold text-muted">Cancel</Text>
        </Pressable>
      </View>

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
            placeholder="Football Tue & Thu"
            autoFocus
          />
          {people.map((person, index) => (
            <TextField
              key={index}
              label={index === 0 ? 'People' : `Person ${index + 1}`}
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
        They don&apos;t need the app yet. You can invite them later and they&apos;ll see the whole
        history.
      </Text>
      {error ? <Text className="text-base text-danger">{error}</Text> : null}
      <Button title="Add to scoreboard" onPress={save} loading={create.isPending} />
    </Screen>
  );
}
