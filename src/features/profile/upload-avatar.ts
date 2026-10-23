import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { createAvatarUpload, updateMe } from '@/api/generated/endpoints/me/me';

export type UploadAvatarDeps = {
  pick: () => Promise<{ uri: string } | null>;
  resize: (uri: string) => Promise<{ uri: string }>;
  requestUpload: (body: {
    contentType: 'image/jpeg';
  }) => Promise<{ uploadUrl: string; key: string }>;
  put: (url: string, fileUri: string, contentType: string) => Promise<void>;
  save: (key: string) => Promise<unknown>;
};

/** Pick → shrink on the phone → upload straight to the bucket → tell the API the new key. */
export async function uploadAvatar(deps: UploadAvatarDeps): Promise<'cancelled' | 'saved'> {
  const picked = await deps.pick();
  if (!picked) return 'cancelled';
  const small = await deps.resize(picked.uri);
  const { uploadUrl, key } = await deps.requestUpload({ contentType: 'image/jpeg' });
  await deps.put(uploadUrl, small.uri, 'image/jpeg');
  await deps.save(key);
  return 'saved';
}

export const avatarUploadDeps: UploadAvatarDeps = {
  async pick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    return result.canceled || !result.assets[0] ? null : { uri: result.assets[0].uri };
  },
  async resize(uri) {
    const image = await ImageManipulator.manipulate(uri)
      .resize({ width: 512, height: 512 })
      .renderAsync();
    const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
    return { uri: saved.uri };
  },
  requestUpload: (body) => createAvatarUpload(body),
  async put(url, fileUri, contentType) {
    const file = await fetch(fileUri);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: await file.blob(),
    });
    if (!response.ok) throw new Error(`Upload failed with ${response.status}`);
  },
  save: (key) => updateMe({ avatarKey: key }),
};
