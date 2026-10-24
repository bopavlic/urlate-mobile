import type { Entitlements } from '@/api/generated/model';

function day(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function premiumStatus(entitlements: Entitlements): string | null {
  if (!entitlements.premium || !entitlements.premiumUntil) return null;
  return entitlements.premiumRenews === false
    ? `Ends on ${day(entitlements.premiumUntil)}. Renew any time.`
    : `Renews on ${day(entitlements.premiumUntil)}.`;
}

export function storeName(store: Entitlements['premiumStore']): string {
  return store === 'GOOGLE' ? 'Google Play' : 'the App Store';
}

/** Free accounts create two groups; joining other people's groups is never limited. */
export function groupLimitReached(entitlements: Entitlements | undefined): boolean {
  if (!entitlements || entitlements.groupLimit === null) return false;
  return entitlements.groupsCreated >= entitlements.groupLimit;
}
