import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useColors } from '@/theme/appearance';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const container: Record<Variant, string> = {
  primary: 'bg-accent',
  secondary: 'border-2 border-ink',
  ghost: '',
  danger: 'border-2 border-danger',
};

const label: Record<Variant, string> = {
  primary: 'text-on-accent',
  secondary: 'text-ink',
  ghost: 'text-ink underline',
  danger: 'text-danger',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  className = '',
  accessibilityLabel,
}: {
  title: string;
  /** When the visible title needs context, e.g. "Invite Ana" for a row's "Invite". */
  accessibilityLabel?: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  const inactive = disabled || loading;
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 active:opacity-80 ${
        container[variant]
      } ${inactive ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onAccent : colors.ink} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`text-lg font-bold ${label[variant]}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
