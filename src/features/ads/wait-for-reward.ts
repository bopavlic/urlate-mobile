import type { Entitlements } from '@/api/generated/model';

/** A reward is new when ads-left drops or a perk runs longer than before. */
function rewardArrived(before: Entitlements, now: Entitlements): boolean {
  if (now.adsLeftToday < before.adsLeftToday) return true;
  const latest = (e: Entitlements) => Math.max(0, ...e.rewards.map((r) => Date.parse(r.expiresAt)));
  return latest(now) > latest(before);
}

/**
 * The reward is granted by AdMob's callback to the API, not by the app, so it lands a moment
 * after the ad closes. Polls entitlements until it shows up; null if it hasn't after a while.
 */
export async function waitForReward(input: {
  fetch: () => Promise<Entitlements>;
  before: Entitlements;
  sleep?: (ms: number) => Promise<void>;
  attempts?: number;
  delayMs?: number;
}): Promise<Entitlements | null> {
  const sleep = input.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const attempts = input.attempts ?? 10;
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(input.delayMs ?? 1_500);
    const now = await input.fetch();
    if (rewardArrived(input.before, now)) return now;
  }
  return null;
}
