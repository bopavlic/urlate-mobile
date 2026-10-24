import type { Entitlements } from '@/api/generated/model';

import { groupLimitReached, premiumStatus, storeName } from './copy';

const premium: Entitlements = {
  premium: true,
  premiumUntil: '2026-11-24T12:00:00.000Z',
  premiumStore: 'APPLE',
  premiumRenews: true,
  features: { shareStyles: true, unlimitedGroups: true },
  rewards: [],
  adsLeftToday: 0,
  groupsCreated: 3,
  groupLimit: null,
};

describe('premiumStatus', () => {
  it('says when premium renews or ends', () => {
    expect(premiumStatus(premium)).toBe('Renews on 24 November 2026.');
    expect(premiumStatus({ ...premium, premiumRenews: false })).toBe(
      'Ends on 24 November 2026. Renew any time.',
    );
  });

  it('has nothing to say without premium', () => {
    expect(premiumStatus({ ...premium, premium: false, premiumUntil: null })).toBeNull();
  });
});

describe('storeName', () => {
  it('names the store to manage it in', () => {
    expect(storeName('APPLE')).toBe('the App Store');
    expect(storeName('GOOGLE')).toBe('Google Play');
  });
});

describe('groupLimitReached', () => {
  it('is reached at two groups created on a free account', () => {
    const free = { ...premium, premium: false, groupLimit: 2 };
    expect(groupLimitReached({ ...free, groupsCreated: 1 })).toBe(false);
    expect(groupLimitReached({ ...free, groupsCreated: 2 })).toBe(true);
  });

  it('never applies to premium, or before entitlements load', () => {
    expect(groupLimitReached({ ...premium, groupsCreated: 9 })).toBe(false);
    expect(groupLimitReached(undefined)).toBe(false);
  });
});
