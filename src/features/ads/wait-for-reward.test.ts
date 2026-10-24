import type { Entitlements } from '@/api/generated/model';

import { waitForReward } from './wait-for-reward';

const base: Entitlements = {
  premium: false,
  premiumUntil: null,
  premiumStore: null,
  premiumRenews: null,
  features: { shareStyles: false, unlimitedGroups: false, fullStats: false, themes: false },
  rewards: [],
  adsLeftToday: 3,
  groupsCreated: 0,
  groupLimit: 2,
};
const rewarded: Entitlements = {
  ...base,
  features: { shareStyles: true, unlimitedGroups: false, fullStats: false, themes: false },
  rewards: [{ perk: 'SHARE_STYLES', expiresAt: '2026-10-25T12:00:00.000Z' }],
  adsLeftToday: 2,
};
const noWait = () => Promise.resolve();

describe('waitForReward', () => {
  it('asks the API until AdMob’s callback has unlocked the perk', async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(base)
      .mockResolvedValueOnce(base)
      .mockResolvedValueOnce(rewarded);
    await expect(waitForReward({ fetch, before: base, sleep: noWait })).resolves.toBe(rewarded);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('notices a reward that extends one still running', async () => {
    const later = {
      ...rewarded,
      rewards: [{ perk: 'SHARE_STYLES' as const, expiresAt: '2026-10-26T12:00:00.000Z' }],
    };
    const fetch = jest.fn().mockResolvedValueOnce(rewarded).mockResolvedValueOnce(later);
    await expect(waitForReward({ fetch, before: rewarded, sleep: noWait })).resolves.toBe(later);
  });

  it('gives up after a while and returns null', async () => {
    const fetch = jest.fn().mockResolvedValue(base);
    await expect(
      waitForReward({ fetch, before: base, sleep: noWait, attempts: 4 }),
    ).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(4);
  });
});
