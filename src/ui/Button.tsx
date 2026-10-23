import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { palette } from "@/theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const container: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "border-2 border-ink",
  ghost: "",
  danger: "border-2 border-danger",
};

const label: Record<Variant, string> = {
  primary: "text-on-accent",
  secondary: "text-ink",
  ghost: "text-ink underline",
  danger: "text-danger",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  className = "",
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 active:opacity-80 ${
        container[variant]
      } ${inactive ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={palette.light.ink} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`text-lg font-bold ${label[variant]}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
