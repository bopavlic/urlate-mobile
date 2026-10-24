import type { ComponentRef, Ref } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useColors } from '@/theme/appearance';

export function TextField({
  label,
  hint,
  error,
  className = '',
  ref,
  ...props
}: TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}) {
  const colors = useColors();
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        className={`min-h-14 rounded-2xl border-[1.5px] bg-surface px-4 text-lg text-ink ${
          error ? 'border-danger' : 'border-surface focus:border-accent'
        } ${className}`}
        {...props}
      />
      {error ? (
        <Text className="text-sm text-danger">{error}</Text>
      ) : hint ? (
        <Text className="text-sm text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
