import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { normaliseCode } from './email';

const LENGTH = 6;

/** Six boxes backed by one hidden input, so paste and SMS/email autofill just work. */
export function CodeInput({
  onComplete,
  disabled = false,
}: {
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  const [code, setCode] = useState('');
  const reported = useRef<string | null>(null);
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  function handleChange(text: string) {
    const next = normaliseCode(text);
    setCode(next);
    if (next.length === LENGTH && reported.current !== next) {
      reported.current = next;
      onComplete(next);
    }
    if (next.length < LENGTH) reported.current = null;
  }

  return (
    <Pressable onPress={() => input.current?.focus()} className="flex-row justify-between gap-2">
      {Array.from({ length: LENGTH }, (_, i) => {
        const filled = i < code.length;
        const active = i === code.length;
        return (
          <View
            key={i}
            className={`h-16 flex-1 items-center justify-center rounded-xl border-2 ${
              active ? 'border-ink' : filled ? 'border-line bg-surface' : 'border-line'
            }`}
          >
            <Text className="font-display text-4xl text-ink">{code[i] ?? ''}</Text>
          </View>
        );
      })}
      <TextInput
        ref={input}
        accessibilityLabel="Sign-in code"
        value={code}
        onChangeText={handleChange}
        editable={!disabled}
        autoFocus
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={LENGTH + 4}
        className="absolute h-full w-full opacity-0"
      />
    </Pressable>
  );
}
