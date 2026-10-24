import iconList from '../../../assets/icons/icons.json';

// Which app icon is on, and switching it. No native code here, so it can be tested.

export type IconId = 'classic' | 'concert' | 'library' | 'parking' | 'cinema' | 'raffle';

export const ICON_IDS = iconList.map((icon) => icon.id as IconId);

export const DEFAULT_ICON: IconId = 'classic';

/** "parking" → "Parking", as app.config.ts names them; the default icon has no name. */
export function nativeIconName(id: IconId): string | null {
  if (id === DEFAULT_ICON) return null;
  return id.replace(/(^|-)(\w)/g, (_match, _dash, letter: string) => letter.toUpperCase());
}

export function iconIdFromNative(name: string | null): IconId {
  return ICON_IDS.find((id) => nativeIconName(id) === name) ?? DEFAULT_ICON;
}

export type IconSwitcherDeps = {
  platform: string;
  set: (name: string | null) => Promise<unknown>;
  get: () => string | null;
};

/**
 * iOS switches at once (with its own "You have changed the icon" alert). Android swaps the
 * launcher entry, which can close the running app, so the change waits until it's in the
 * background.
 */
export function createIconSwitcher(deps: IconSwitcherDeps) {
  let pending: IconId | null = null;

  async function apply(id: IconId) {
    const name = nativeIconName(id);
    if (deps.get() !== name) await deps.set(name);
  }

  return {
    current(): IconId {
      return pending ?? iconIdFromNative(deps.get());
    },
    async choose(id: IconId): Promise<void> {
      if (deps.platform === 'android') {
        pending = id;
        return;
      }
      await apply(id);
    },
    async applyPending(): Promise<void> {
      if (!pending) return;
      const id = pending;
      pending = null;
      await apply(id);
    },
  };
}
