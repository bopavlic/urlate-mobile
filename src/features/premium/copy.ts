import type { Entitlements } from '@/api/generated/model';

function day(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function premiumStatus(entitlements: Entitlements): string | null {
  if (!entitlements.premium) return null;
  // Premium without a store subscription: the app review account.
  if (!entitlements.premiumUntil) return 'Premium is on for this account.';
  return entitlements.premiumRenews === false
    ? `Ends on ${day(entitlements.premiumUntil)}. Renew any time.`
    : `Renews on ${day(entitlements.premiumUntil)}.`;
}

export function storeName(store: Entitlements['premiumStore']): string {
  return store === 'GOOGLE' ? 'Google Play' : 'the App Store';
}

/** The store a subscription is managed and cancelled in; null when there is none. */
export function subscribedIn(entitlements: Entitlements | undefined): string | null {
  return entitlements?.premium && entitlements.premiumStore
    ? storeName(entitlements.premiumStore)
    : null;
}

/** Free accounts create two groups; joining other people's groups is never limited. */
export function groupLimitReached(entitlements: Entitlements | undefined): boolean {
  if (!entitlements || entitlements.groupLimit === null) return false;
  return entitlements.groupsCreated >= entitlements.groupLimit;
}
