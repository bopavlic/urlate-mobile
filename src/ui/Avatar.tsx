import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { initials } from './avatar-initials';

export function Avatar({
  name,
  url,
  size = 44,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const dimensions = { width: size, height: size, borderRadius: size / 2 };
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={dimensions}
        contentFit="cover"
        transition={150}
        accessibilityLabel={name}
      />
    );
  }
  return (
    <View
      style={dimensions}
      className="items-center justify-center border-2 border-line bg-surface"
      accessibilityLabel={name}
    >
      <Text className="font-display-bold text-ink" style={{ fontSize: size * 0.42 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
