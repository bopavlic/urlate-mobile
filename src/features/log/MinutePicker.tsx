import { Pressable, Text, View } from 'react-native';

export const MINUTE_CHIPS = [1, 2, 5, 10, 15] as const;

function StepButton({
  label,
  symbol,
  onPress,
}: {
  label: string;
  symbol: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-14 w-14 items-center justify-center rounded-full border-2 border-ink active:opacity-70"
    >
      <Text className="font-display text-3xl text-ink">{symbol}</Text>
    </Pressable>
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
        <StepButton label="One minute less" symbol="−" onPress={() => onStep(-1)} />
        <View className="items-center">
          <Text
            className="font-display text-ink"
            style={{ fontSize: 88, lineHeight: 92, fontVariant: ['tabular-nums'] }}
          >
            {value}
          </Text>
          <Text className="font-display-semi text-xl text-muted">min</Text>
        </View>
        <StepButton label="One minute more" symbol="+" onPress={() => onStep(1)} />
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
              className={`h-12 flex-1 items-center justify-center rounded-xl border-2 ${
                selected ? 'border-ink bg-ink' : 'border-line'
              }`}
            >
              <Text
                className={`font-display-bold text-2xl ${selected ? 'text-paper' : 'text-ink'}`}
              >
                {chip}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
