import { randomUUID } from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useReducer, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

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
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import { Ticket } from '@/ui/Ticket';

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
            className={`min-h-16 min-w-[46%] flex-1 items-center justify-center rounded-2xl px-4 ${
              isSelected ? (member.isMe ? 'bg-ink' : 'bg-accent') : 'bg-surface'
            }`}
          >
            <Text
              className={`font-display-bold text-xl ${
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

/**
 * Groups: everyone else waited unless tapped off. You stay on when someone else was late,
 * because only people who were there can log it.
 */
function WhoWaited({
  members,
  lateMemberId,
  absent,
  onToggle,
}: {
  members: Member[];
  lateMemberId: string;
  absent: string[];
  onToggle: (memberId: string) => void;
}) {
  const others = members.filter((member) => member.id !== lateMemberId);
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="text-lg font-semibold text-ink">Who waited?</Text>
        <Text className="text-base text-muted">Tap anyone who wasn&apos;t there.</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {others.map((member) => {
          const waited = !absent.includes(member.id);
          const locked = member.isMe;
          return (
            <Pressable
              key={member.id}
              accessibilityRole="checkbox"
              accessibilityLabel={member.isMe ? 'Me' : member.displayName}
              accessibilityState={{ checked: waited, disabled: locked }}
              disabled={locked}
              onPress={() => onToggle(member.id)}
              className={`rounded-full px-4 py-2.5 ${waited ? 'bg-ink' : 'bg-surface'}`}
            >
              <Text className={`text-base font-semibold ${waited ? 'text-paper' : 'text-muted'}`}>
                {member.isMe ? 'Me' : member.displayName}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
        <Text className="text-lg text-muted">Add someone first, then log away.</Text>
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

/** The one animation in the app: the fresh ticket slides up and lands, slightly tilted. */
function Logged({
  message,
  minutes,
  lateWasMe,
  offender,
  waiter,
}: {
  message: string;
  minutes: number;
  lateWasMe: boolean;
  offender: string;
  waiter: string;
}) {
  const [land] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) land.setValue(1);
      else
        Animated.spring(land, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [land]);
  const motion = {
    opacity: land.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
    transform: [
      { translateY: land.interpolate({ inputRange: [0, 1], outputRange: [260, 0] }) },
      { rotate: land.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '-3deg'] }) },
    ],
  };
  return (
    <View className="flex-1 justify-center gap-8 px-4">
      <Animated.View style={motion}>
        <Ticket
          tone={lateWasMe ? 'owing' : 'owed'}
          minutes={minutes}
          prefix="+"
          offender={offender}
          waiter={waiter}
          tilt={0}
        />
      </Animated.View>
      <Text className="text-center font-display text-2xl text-ink">{message}</Text>
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
  const [done, setDone] = useState<{
    message: string;
    lateWasMe: boolean;
    offender: string;
    waiter: string;
  } | null>(null);

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

  const body = toCreateEntryBody(
    state,
    requestId,
    members?.map((member) => member.id),
  );

  async function save() {
    if (!body || !state.ledgerId) return;
    setError(null);
    try {
      await createEntry.mutateAsync({ id: state.ledgerId, data: body });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const late = members?.find((m) => m.id === state.lateMemberId);
      const lateWasMe = !!late?.isMe;
      const them =
        ledger.data?.kind === 'PAIR'
          ? (members?.find((m) => !m.isMe)?.displayName ?? 'Them')
          : 'Everyone';
      setDone({
        message: loggedToast(state.minutes, lateWasMe),
        lateWasMe,
        offender: (lateWasMe ? 'You' : (late?.displayName ?? 'Someone')).toUpperCase(),
        waiter: (lateWasMe ? them : 'You').toUpperCase(),
      });
      void refreshLedgers();
    } catch {
      setError("Couldn't save. Try again; it'll still count only once.");
    }
  }

  if (done) {
    return (
      <Screen>
        <Logged {...done} minutes={state.minutes} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="gap-8 px-6 pb-8" keyboardShouldPersistTaps="handled">
        <ScreenHeader title={state.ledgerId ? 'Who was late?' : 'Who was it with?'} />
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
            {ledger.data?.kind === 'GROUP' && state.lateMemberId ? (
              <WhoWaited
                members={members}
                lateMemberId={state.lateMemberId}
                absent={state.absent}
                onToggle={(memberId) => dispatch({ type: 'toggleAbsent', memberId })}
              />
            ) : null}
            <View className="gap-4">
              <Text className="text-lg font-semibold text-ink">How late?</Text>
              <MinutePicker
                value={state.minutes}
                onChange={(minutes) => dispatch({ type: 'chip', minutes })}
                onStep={(delta) => dispatch({ type: 'step', delta })}
              />
            </View>
            <TextField
              label="Note (optional)"
              value={state.note}
              onChangeText={(note) => dispatch({ type: 'note', note })}
              placeholder="dinner"
              maxLength={140}
            />
            <WhenPicker
              value={state.occurredAt}
              onChange={(occurredAt) => dispatch({ type: 'date', occurredAt })}
            />
          </>
        )}
      </ScrollView>

      {/* Pinned: always one thumb away, and lifted above the keyboard. */}
      {members ? (
        <View className="gap-2 border-t border-line bg-paper px-6 pb-2 pt-3">
          {error ? <Text className="text-base text-danger">{error}</Text> : null}
          <Button title="Save" onPress={save} disabled={!body} loading={createEntry.isPending} />
        </View>
      ) : null}
    </Screen>
  );
}
