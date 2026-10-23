import { uploadAvatar, type UploadAvatarDeps } from './upload-avatar';

function deps(overrides: Partial<UploadAvatarDeps> = {}) {
  const calls: string[] = [];
  const base: UploadAvatarDeps = {
    pick: async () => {
      calls.push('pick');
      return { uri: 'file:///picked.heic' };
    },
    resize: async (uri) => {
      calls.push(`resize:${uri}`);
      return { uri: 'file:///small.jpg' };
    },
    requestUpload: async (body) => {
      calls.push(`request:${body.contentType}`);
      return { uploadUrl: 'http://s3/put', key: 'avatars/u1/abc.jpg' };
    },
    put: async (url, fileUri, contentType) => {
      calls.push(`put:${url}:${fileUri}:${contentType}`);
    },
    save: async (key) => {
      calls.push(`save:${key}`);
    },
  };
  return { deps: { ...base, ...overrides }, calls };
}

describe('uploadAvatar', () => {
  it('does nothing when the picker is cancelled', async () => {
    const { deps: d, calls } = deps({ pick: async () => null });
    await expect(uploadAvatar(d)).resolves.toBe('cancelled');
    expect(calls).toEqual([]);
  });

  it('resizes, uploads straight to storage, then saves the key', async () => {
    const { deps: d, calls } = deps();
    await expect(uploadAvatar(d)).resolves.toBe('saved');
    expect(calls).toEqual([
      'pick',
      'resize:file:///picked.heic',
      'request:image/jpeg',
      'put:http://s3/put:file:///small.jpg:image/jpeg',
      'save:avatars/u1/abc.jpg',
    ]);
  });

  it('does not save the key when the upload fails', async () => {
    const { deps: d, calls } = deps({
      put: async () => {
        throw new Error('network');
      },
    });
    await expect(uploadAvatar(d)).rejects.toThrow('network');
    expect(calls.some((call) => call.startsWith('save'))).toBe(false);
  });
});
