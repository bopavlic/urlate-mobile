import { randomUUID } from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useReducer, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useCreateEntry } from '@/api/generated/endpoints/entries/entries';
import { useGetLedger } from '@/api/generated/endpoints/ledgers/ledgers';
import type { Member } from '@/api/generated/model';
import { loggedToast } from '@/features/balance/copy';
import { LedgerRow } from '@/features/ledgers/LedgerRow';
import { refreshLedgers, useLedgers } from '@/features/ledgers/queries';
import { initialLogState, logReducer, toCreateEntryBody } from '@/features/log/log-form';
import { MinutePicker } from '@/features/log/MinutePicker';
import { WhenPicker } from '@/features/log/WhenPicker';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';
import { Title } from '@/ui/Title';

function WhoWasLate({
  members,
  selected,
  onPick,
}: {
  members: Member[];
  selected: string | null;
  onPick: (memberId: string) => void;
}) {
  // Pairs: them first (the usual suspect), then me. Groups: everyone.
  const ordered = [...members].sort((a, b) => Number(a.isMe) - Number(b.isMe));
  return (
    <View className="flex-row flex-wrap gap-3">
      {ordered.map((member) => {
        const isSelected = member.id === selected;
        return (
          <Pressable
            key={member.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onPick(member.id)}
            // rotate-0 by default: NativeWind remounts elements that gain transform variables later.
            className={`min-h-16 min-w-[46%] flex-1 rotate-0 items-center justify-center rounded-2xl border-2 px-4 ${
              isSelected
                ? member.isMe
                  ? 'border-ink bg-ink'
                  : '-rotate-2 border-accent bg-accent'
                : 'border-line'
            }`}
          >
            <Text
              className={`font-display-bold text-2xl ${
                isSelected ? (member.isMe ? 'text-paper' : 'text-on-accent') : 'text-ink'
              }`}
              numberOfLines={1}
            >
              {member.isMe ? 'Me' : member.displayName}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PickLedger({ onPick }: { onPick: (ledgerId: string) => void }) {
  const ledgers = useLedgers();
  const items = ledgers.data?.pages.flatMap((page) => page.items) ?? [];
  if (ledgers.isPending) return <ActivityIndicator className="mt-8" />;
  if (items.length === 0) {
    return (
      <View className="gap-4 pt-8">
        <Text className="text-lg text-muted">
          Add someone to your scoreboard first, then log away.
        </Text>
        <Button title="Add someone" onPress={() => router.replace('/ledgers/new')} />
      </View>
    );
  }
  return (
    <View>
      {items.map((ledger) => (
        <LedgerRow key={ledger.id} ledger={ledger} onPress={() => onPick(ledger.id)} />
      ))}
    </View>
  );
}

function Logged({ message, minutes }: { message: string; minutes: number }) {
  return (
    <View className="flex-1 items-center justify-center gap-8 px-8">
      <View className="h-[200px] w-[150px] -rotate-6 items-center justify-center rounded-[18px] bg-accent shadow-lg shadow-black/30">
        <Text className="font-display text-7xl text-on-accent">+{minutes}</Text>
      </View>
      <Text className="text-center font-display-bold text-3xl text-ink">{message}</Text>
    </View>
  );
}

export default function Log() {
  const params = useLocalSearchParams<{ ledgerId?: string }>();
  const [state, dispatch] = useReducer(logReducer, params.ledgerId ?? null, initialLogState);
  const ledger = useGetLedger(state.ledgerId ?? '', { query: { enabled: !!state.ledgerId } });
  const createEntry = useCreateEntry();
  // Same id for every retry of this save, so a double tap or flaky network logs it once.
  const [requestId] = useState(randomUUID);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // A pair has only one "them": preselect them so logging is tap-minutes-save.
  const members = ledger.data?.members;
  useEffect(() => {
    if (!state.lateMemberId && ledger.data?.kind === 'PAIR') {
      const them = members?.find((member) => !member.isMe);
      if (them) dispatch({ type: 'pickLate', memberId: them.id });
    }
  }, [members, ledger.data?.kind, state.lateMemberId]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.back(), 1400);
    return () => clearTimeout(timer);
  }, [done]);

  const body = toCreateEntryBody(state, requestId);

  async function save() {
    if (!body || !state.ledgerId) return;
    setError(null);
    try {
      await createEntry.mutateAsync({ id: state.ledgerId, data: body });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const lateWasMe = !!members?.find((m) => m.id === state.lateMemberId)?.isMe;
      setDone(loggedToast(state.minutes, lateWasMe));
      void refreshLedgers();
    } catch {
      setError("Couldn't save. Try again; it'll still count only once.");
    }
  }

  if (done) {
    return (
      <Screen>
        <Logged message={done} minutes={state.minutes} />
      </Screen>
    );
  }

  return (
    <Screen className="px-0">
      <View className="flex-row items-center justify-between px-6 pb-2 pt-6">
        <Title className="text-4xl leading-[44px]">Who was late?</Title>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <Text className="text-base font-semibold text-muted">Cancel</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="gap-8 px-6 pb-10" keyboardShouldPersistTaps="handled">
        {!state.ledgerId ? (
          <PickLedger onPick={(ledgerId) => dispatch({ type: 'pickLedger', ledgerId })} />
        ) : !members ? (
          <ActivityIndicator className="mt-8" />
        ) : (
          <>
            <WhoWasLate
              members={members}
              selected={state.lateMemberId}
              onPick={(memberId) => dispatch({ type: 'pickLate', memberId })}
            />
            <MinutePicker
              value={state.minutes}
              onChange={(minutes) => dispatch({ type: 'chip', minutes })}
              onStep={(delta) => dispatch({ type: 'step', delta })}
            />
            <TextField
              label="Note (optional)"
              value={state.note}
              onChangeText={(note) => dispatch({ type: 'note', note })}
              placeholder="football"
              maxLength={140}
            />
            <WhenPicker
              value={state.occurredAt}
              onChange={(occurredAt) => dispatch({ type: 'date', occurredAt })}
            />
            {error ? <Text className="text-base text-danger">{error}</Text> : null}
            <Button
              title="Log it"
              onPress={save}
              disabled={!body}
              loading={createEntry.isPending}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
