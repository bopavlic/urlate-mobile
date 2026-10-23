import type { ComponentRef, Ref } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

export function TextField({
  label,
  hint,
  error,
  className = "",
  ref,
  ...props
}: TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor="#8FA39A"
        className={`min-h-14 rounded-2xl border-2 bg-surface px-4 text-lg text-ink ${
          error ? "border-danger" : "border-line focus:border-ink"
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
