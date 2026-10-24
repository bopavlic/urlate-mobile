import { createIconSwitcher, iconIdFromNative, nativeIconName } from './switcher';

describe('native icon names', () => {
  it('are PascalCase, and the classic icon is the default (null)', () => {
    expect(nativeIconName('red-card')).toBe('RedCard');
    expect(nativeIconName('classic')).toBeNull();
    expect(iconIdFromNative('AwayKit')).toBe('away-kit');
    expect(iconIdFromNative(null)).toBe('classic');
    expect(iconIdFromNative('Gone')).toBe('classic');
  });
});

function fakeNative(initial: string | null = null) {
  let current = initial;
  return {
    set: jest.fn(async (name: string | null) => {
      current = name;
      return name;
    }),
    get: () => current,
  };
}

describe('createIconSwitcher', () => {
  it('switches straight away on iOS', async () => {
    const native = fakeNative();
    const icons = createIconSwitcher({ platform: 'ios', ...native });
    await icons.choose('third-kit');
    expect(native.set).toHaveBeenCalledWith('ThirdKit');
    expect(icons.current()).toBe('third-kit');
  });

  it('waits for the background on Android, where switching can close the app', async () => {
    const native = fakeNative();
    const icons = createIconSwitcher({ platform: 'android', ...native });
    await icons.choose('floodlights');
    expect(native.set).not.toHaveBeenCalled();
    expect(icons.current()).toBe('floodlights');
    await icons.applyPending();
    expect(native.set).toHaveBeenCalledWith('Floodlights');
    await icons.applyPending();
    expect(native.set).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the icon is already the one chosen', async () => {
    const native = fakeNative('RedCard');
    const icons = createIconSwitcher({ platform: 'ios', ...native });
    await icons.choose('red-card');
    expect(native.set).not.toHaveBeenCalled();
  });
});
