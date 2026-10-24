import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export const MINUTE_CHIPS = [1, 2, 5, 10, 15, 30] as const;

const HOLD_DELAY_MS = 400;
const FIRST_REPEAT_MS = 120;
const FASTEST_REPEAT_MS = 40;

/** Press steps once; holding keeps stepping, faster and faster (like iOS steppers). */
function useHoldToRepeat(step: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedIn = useRef(false);

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  return {
    onPressIn: () => {
      pressedIn.current = true;
      step();
      let delay = FIRST_REPEAT_MS;
      const repeat = () => {
        step();
        delay = Math.max(FASTEST_REPEAT_MS, delay * 0.85);
        timer.current = setTimeout(repeat, delay);
      };
      timer.current = setTimeout(repeat, HOLD_DELAY_MS);
    },
    onPressOut: stop,
    // Screen readers activate without a press-in: step once for them.
    onPress: () => {
      if (!pressedIn.current) step();
      pressedIn.current = false;
    },
  };
}

function StepButton({
  label,
  symbol,
  onStep,
}: {
  label: string;
  symbol: string;
  onStep: () => void;
}) {
  const hold = useHoldToRepeat(onStep);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      {...hold}
      className="h-14 w-14 items-center justify-center rounded-full bg-surface active:opacity-70"
    >
      <Text className="font-display text-2xl text-ink">{symbol}</Text>
    </Pressable>
  );
}

/** The minutes, typed straight into the big number while editing. */
function MinutesInput({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <TextInput
      accessibilityLabel="Minutes late"
      accessibilityHint="Type how many minutes"
      value={draft ?? String(value)}
      onFocus={() => setDraft(String(value))}
      onChangeText={(text) => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        setDraft(digits);
        const minutes = parseInt(digits, 10);
        if (minutes >= 1) onChange(minutes);
      }}
      onBlur={() => setDraft(null)}
      keyboardType="number-pad"
      returnKeyType="done"
      selectTextOnFocus
      maxLength={4}
      className="min-w-32 text-center font-display text-ink"
      style={{
        fontSize: 80,
        lineHeight: 92,
        letterSpacing: -2,
        fontVariant: ['tabular-nums'],
        padding: 0,
      }}
    />
  );
}

export function MinutePicker({
  value,
  onChange,
  onStep,
}: {
  value: number;
  onChange: (minutes: number) => void;
  onStep: (delta: 1 | -1) => void;
}) {
  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between">
        <StepButton label="One minute less" symbol="−" onStep={() => onStep(-1)} />
        <View className="items-center">
          {/* The dashed underline marks the number as editable: tap it to type. */}
          <View className="border-b-2 border-dashed border-line px-2">
            <MinutesInput value={value} onChange={onChange} />
          </View>
          <Text className="mt-1 font-display-semi text-lg text-muted">min</Text>
        </View>
        <StepButton label="One minute more" symbol="+" onStep={() => onStep(1)} />
      </View>
      <View className="flex-row justify-between gap-2">
        {MINUTE_CHIPS.map((chip) => {
          const selected = chip === value;
          return (
            <Pressable
              key={chip}
              accessibilityRole="button"
              accessibilityLabel={`${chip} min`}
              accessibilityState={{ selected }}
              onPress={() => onChange(chip)}
              className={`h-12 flex-1 items-center justify-center rounded-full ${
                selected ? 'bg-ink' : 'bg-surface'
              }`}
            >
              <Text className={`font-display-bold text-xl ${selected ? 'text-paper' : 'text-ink'}`}>
                {chip}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
