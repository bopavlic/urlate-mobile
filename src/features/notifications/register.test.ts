import { registerForPush, unregisterPush, type PushDeps } from './register';

function deps(overrides: Partial<PushDeps> = {}): PushDeps & { registered: string[] } {
  const registered: string[] = [];
  return {
    registered,
    isDevice: true,
    platform: 'ios',
    projectId: 'project-1',
    getPermission: jest.fn().mockResolvedValue('granted'),
    requestPermission: jest.fn().mockResolvedValue('granted'),
    setupChannel: jest.fn().mockResolvedValue(undefined),
    getToken: jest.fn().mockResolvedValue('ExponentPushToken[abc]'),
    register: jest.fn(async (token: string) => {
      registered.push(token);
    }),
    unregister: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

afterEach(async () => {
  await unregisterPush(deps());
});

describe('registerForPush', () => {
  it('sends the device token to the API when notifications are allowed', async () => {
    const d = deps();
    expect(await registerForPush(d, { ask: false })).toBe('registered');
    expect(d.getToken).toHaveBeenCalledWith('project-1');
    expect(d.register).toHaveBeenCalledWith('ExponentPushToken[abc]', 'IOS');
  });

  it("doesn't ask on its own; only when the person taps to turn them on", async () => {
    const d = deps({ getPermission: jest.fn().mockResolvedValue('undetermined') });
    expect(await registerForPush(d, { ask: false })).toBe('undetermined');
    expect(d.requestPermission).not.toHaveBeenCalled();
    expect(await registerForPush(d, { ask: true })).toBe('registered');
    expect(d.requestPermission).toHaveBeenCalled();
  });

  it('respects a no', async () => {
    const d = deps({
      getPermission: jest.fn().mockResolvedValue('undetermined'),
      requestPermission: jest.fn().mockResolvedValue('denied'),
    });
    expect(await registerForPush(d, { ask: true })).toBe('denied');
    expect(d.register).not.toHaveBeenCalled();
  });

  it('creates the Android channel before asking, so Android 13 shows the prompt', async () => {
    const order: string[] = [];
    const d = deps({
      platform: 'android',
      getPermission: jest.fn().mockResolvedValue('undetermined'),
      setupChannel: jest.fn(async () => {
        order.push('channel');
      }),
      requestPermission: jest.fn(async () => {
        order.push('ask');
        return 'granted' as const;
      }),
    });
    await registerForPush(d, { ask: true });
    expect(order).toEqual(['channel', 'ask']);
    expect(d.register).toHaveBeenCalledWith('ExponentPushToken[abc]', 'ANDROID');
  });

  it('is unavailable on simulators and builds without an EAS project', async () => {
    expect(await registerForPush(deps({ isDevice: false }), { ask: true })).toBe('unavailable');
    expect(await registerForPush(deps({ projectId: undefined }), { ask: true })).toBe(
      'unavailable',
    );
  });
});

describe('unregisterPush', () => {
  it('removes the token this device registered, once', async () => {
    const d = deps();
    await registerForPush(d, { ask: false });
    await unregisterPush(d);
    await unregisterPush(d);
    expect(d.unregister).toHaveBeenCalledTimes(1);
    expect(d.unregister).toHaveBeenCalledWith('ExponentPushToken[abc]');
  });

  it('never blocks signing out when the API is unreachable', async () => {
    const d = deps({ unregister: jest.fn().mockRejectedValue(new Error('offline')) });
    await registerForPush(d, { ask: false });
    await expect(unregisterPush(d)).resolves.toBeUndefined();
  });
});
