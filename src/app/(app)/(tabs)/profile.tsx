import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Share, Text, View } from 'react-native';

import { deleteMe, getGetMeQueryKey, useGetMe } from '@/api/generated/endpoints/me/me';
import {
  getGetMyInviteQueryKey,
  resetMyInvite,
  useGetMyInvite,
} from '@/api/generated/endpoints/people/people';
import { privacyChoicesRequired, rewardedUnit, showPrivacyChoices } from '@/features/ads/rewarded';
import { personalShareMessage } from '@/features/invites/copy';
import { MyInviteCode } from '@/features/invites/MyInviteCode';
import { refreshLedgers } from '@/features/ledgers/queries';
import { storeName } from '@/features/premium/copy';
import { PremiumRow } from '@/features/premium/PremiumRow';
import { useEntitlements } from '@/features/premium/queries';
import { DeleteAccount } from '@/features/profile/DeleteAccount';
import { ExportData } from '@/features/profile/ExportData';
import { ProfileForm } from '@/features/profile/ProfileForm';
import {
  avatarErrorMessage,
  avatarUploadDeps,
  uploadAvatar,
} from '@/features/profile/upload-avatar';
import { signOut } from '@/lib/auth';
import { queryClient } from '@/providers/query';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';

export default function Profile() {
  const me = useGetMe();
  const entitlements = useEntitlements();
  // EU and UK users must be able to revisit their ad consent; Google says when that applies.
  const adPrivacy = useQuery({
    queryKey: ['ad-privacy-required'],
    queryFn: privacyChoicesRequired,
    enabled: !!rewardedUnit && entitlements.data?.premium === false,
    staleTime: Infinity,
  });
  const myInvite = useGetMyInvite({ query: { staleTime: Infinity } });
  const resetInvite = useMutation({
    mutationFn: () => resetMyInvite(),
    onSuccess: (invite) => queryClient.setQueryData(getGetMyInviteQueryKey(), invite),
  });
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
    } catch (err) {
      setAvatarError(avatarErrorMessage(err));
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

      {entitlements.data ? (
        <PremiumRow entitlements={entitlements.data} onOpen={() => router.push('/premium')} />
      ) : null}

      <ProfileForm key={me.data.id} me={me.data} />

      <MyInviteCode
        invite={myInvite.data}
        username={me.data.username}
        resetting={resetInvite.isPending}
        onReset={() => resetInvite.mutate()}
        onShare={() => {
          if (myInvite.data) void Share.share({ message: personalShareMessage(myInvite.data) });
        }}
      />

      {adPrivacy.data ? (
        <Button
          title="Ad privacy choices"
          variant="ghost"
          onPress={() => void showPrivacyChoices().catch(() => undefined)}
        />
      ) : null}

      <ExportData />

      <Button title="Sign out" variant="ghost" onPress={() => void signOut()} />

      {/* The server ends every session; signing out locally takes the app back to sign-in. */}
      <DeleteAccount
        subscribedIn={entitlements.data?.premium ? storeName(entitlements.data.premiumStore) : null}
        onDelete={async () => {
          await deleteMe();
          await signOut();
        }}
      />
    </Screen>
  );
}
