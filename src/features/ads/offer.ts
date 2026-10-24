import type { Entitlements } from '@/api/generated/model';

// Ads are opt-in only: a button someone taps to unlock a perk for a day (brief: "Ad rules").
// Premium means no ads at all.

export interface AdOffer {
  show: boolean;
  disabled: boolean;
  label: string;
  note: string;
}

export function adOffer(entitlements: Entitlements | undefined, unitId: string | null): AdOffer {
  const left = entitlements?.adsLeftToday ?? 0;
  return {
    show: !!entitlements && !entitlements.premium && !!unitId,
    disabled: left === 0,
    label: 'Watch an ad: unlock for 24 hours',
    note:
      left === 0
        ? 'That’s today’s ads. More tomorrow.'
        : `${left} ${left === 1 ? 'ad' : 'ads'} left today.`,
  };
}

/** Development builds only ever load Google's test ad; release builds need a real unit. */
export function rewardedUnitId(input: {
  dev: boolean;
  platform: 'ios' | 'android';
  ios: string | undefined;
  android: string | undefined;
  test: string;
}): string | null {
  if (input.dev) return input.test;
  return (input.platform === 'ios' ? input.ios : input.android) || null;
}
