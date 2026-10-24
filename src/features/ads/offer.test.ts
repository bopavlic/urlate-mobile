import type { Entitlements } from '@/api/generated/model';

import { adOffer, rewardedUnitId } from './offer';

const free: Entitlements = {
  premium: false,
  premiumUntil: null,
  premiumStore: null,
  premiumRenews: null,
  features: { shareStyles: false, unlimitedGroups: false, fullStats: false },
  rewards: [],
  adsLeftToday: 3,
  groupsCreated: 0,
  groupLimit: 2,
};

describe('adOffer', () => {
  it('offers an ad to unlock a perk for a day', () => {
    expect(adOffer(free, 'unit')).toEqual({
      show: true,
      disabled: false,
      label: 'Watch an ad: unlock for 24 hours',
      note: '3 ads left today.',
    });
  });

  it('says when today’s ads are used up', () => {
    expect(adOffer({ ...free, adsLeftToday: 0 }, 'unit')).toMatchObject({
      show: true,
      disabled: true,
      note: 'That’s today’s ads. More tomorrow.',
    });
    expect(adOffer({ ...free, adsLeftToday: 1 }, 'unit').note).toBe('1 ad left today.');
  });

  it('shows no ads to premium, or when ads aren’t set up', () => {
    expect(adOffer({ ...free, premium: true }, 'unit').show).toBe(false);
    expect(adOffer(free, null).show).toBe(false);
    expect(adOffer(undefined, 'unit').show).toBe(false);
  });
});

describe('rewardedUnitId', () => {
  it('always uses Google’s test unit in development', () => {
    expect(
      rewardedUnitId({ dev: true, platform: 'ios', ios: 'real', android: 'real', test: 'test' }),
    ).toBe('test');
  });

  it('uses the platform’s real unit in release builds, or none', () => {
    const units = { dev: false, ios: 'ios-unit', android: 'android-unit', test: 'test' };
    expect(rewardedUnitId({ ...units, platform: 'ios' })).toBe('ios-unit');
    expect(rewardedUnitId({ ...units, platform: 'android' })).toBe('android-unit');
    expect(rewardedUnitId({ ...units, platform: 'android', android: undefined })).toBeNull();
  });
});
