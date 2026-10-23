import { Pressable, Text, View } from 'react-native';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View accessibilityRole="tablist" className="flex-row rounded-2xl border-2 border-line p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-xl py-3 ${selected ? 'bg-ink' : ''}`}
          >
            <Text className={`text-base font-semibold ${selected ? 'text-paper' : 'text-ink'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
