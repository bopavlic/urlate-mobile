import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, Text, View } from 'react-native';

import { formatWhen } from '@/features/ledgers/when';

/** Defaults to "Just now"; can be moved back in time, never forward. */
export function WhenPicker({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (value: Date | null) => void;
}) {
  const now = new Date();

  function openAndroid() {
    DateTimePickerAndroid.open({
      value: value ?? now,
      mode: 'date',
      maximumDate: now,
      onChange: (event, date) => {
        if (event.type !== 'set' || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: true,
          onChange: (timeEvent, time) => {
            if (timeEvent.type === 'set' && time) onChange(time > new Date() ? new Date() : time);
          },
        });
      },
    });
  }

  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-base font-semibold text-ink">When</Text>
      {Platform.OS === 'ios' ? (
        <View className="flex-row items-center gap-2">
          {value ? (
            <Pressable accessibilityRole="button" onPress={() => onChange(null)} hitSlop={8}>
              <Text className="text-base text-muted underline">Just now</Text>
            </Pressable>
          ) : null}
          <DateTimePicker
            value={value ?? now}
            mode="datetime"
            display="compact"
            maximumDate={now}
            onChange={(_event, date) => onChange(date ?? null)}
          />
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={openAndroid} hitSlop={8}>
          <Text className="text-base text-ink underline">
            {value ? formatWhen(value) : 'Just now'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
