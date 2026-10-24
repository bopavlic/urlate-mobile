import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolView } from 'expo-symbols';
import { Children, Fragment, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { useColors } from '@/theme/appearance';

/** A grouped list of rows on one card, divided by hairlines (e.g. Profile's account actions). */
export function MenuList({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View className="overflow-hidden rounded-2xl bg-surface">
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? <View className="ml-4 h-px bg-line" /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

export function MenuRow({
  title,
  onPress,
  tone = 'default',
  loading = false,
  error,
}: {
  title: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
  loading?: boolean;
  /** Shown under the row when its action failed. */
  error?: string | null;
}) {
  const colors = useColors();
  const color = tone === 'danger' ? colors.danger : colors.muted;
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ busy: loading, disabled: loading }}
        disabled={loading}
        onPress={onPress}
        className="min-h-14 flex-row items-center justify-between px-4 active:opacity-60"
      >
        <Text
          className={`text-base font-semibold ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}
        >
          {title}
        </Text>
        {loading ? (
          <ActivityIndicator color={color} />
        ) : Platform.OS === 'ios' ? (
          <SymbolView name="chevron.right" size={13} weight="semibold" tintColor={color} />
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={20} color={color} />
        )}
      </Pressable>
      {error ? <Text className="px-4 pb-3 text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
