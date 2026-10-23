import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-paper">
      <Text className="text-5xl font-black text-accent">Ur Late</Text>
      <Text className="mt-2 text-base text-muted">Who&apos;s been waiting on who?</Text>
    </View>
  );
}
