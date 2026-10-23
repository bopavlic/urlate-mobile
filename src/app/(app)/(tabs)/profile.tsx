import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { getGetMeQueryKey, useGetMe } from '@/api/generated/endpoints/me/me';
import { refreshLedgers } from '@/features/ledgers/queries';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { avatarUploadDeps, uploadAvatar } from '@/features/profile/upload-avatar';
import { signOut } from '@/lib/auth';
import { queryClient } from '@/providers/query';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';

export default function Profile() {
  const me = useGetMe();
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function changeAvatar() {
    setAvatarError(null);
    setUploading(true);
    try {
      const result = await uploadAvatar(avatarUploadDeps);
      if (result === 'saved') {
        await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        void refreshLedgers();
      }
    } catch {
      setAvatarError("Couldn't upload that photo. Try another one?");
    } finally {
      setUploading(false);
    }
  }

  if (!me.data) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']} className="gap-8 pt-4">
      <Title>Profile</Title>

      <View className="flex-row items-center gap-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={changeAvatar}
          disabled={uploading}
        >
          <Avatar name={me.data.displayName} url={me.data.avatarUrl} size={88} />
          {uploading ? (
            <View className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : null}
        </Pressable>
        <View className="flex-1 gap-1">
          <Text className="font-display-bold text-3xl text-ink" numberOfLines={1}>
            {me.data.displayName}
          </Text>
          <Text className="text-base text-muted" numberOfLines={1}>
            {me.data.email}
          </Text>
          <Text className="text-sm text-muted">Tap the photo to change it.</Text>
        </View>
      </View>
      {avatarError ? <Text className="text-base text-danger">{avatarError}</Text> : null}

      <ProfileForm key={me.data.id} me={me.data} />

      <Button title="Sign out" variant="ghost" onPress={() => void signOut()} />
    </Screen>
  );
}
