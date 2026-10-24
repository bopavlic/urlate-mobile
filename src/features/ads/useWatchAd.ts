import { useState } from 'react';

import { getEntitlements } from '@/api/generated/endpoints/premium/premium';
import { refreshEntitlements, setEntitlements, useEntitlements } from '@/features/premium/queries';
import { authClient } from '@/lib/auth';

import { adOffer } from './offer';
import { rewardedUnit, showRewardedAd } from './rewarded';
import { waitForReward } from './wait-for-reward';
import type { WatchAdState } from './WatchAdButton';

/** Watch one rewarded ad for a perk, then wait for the API to unlock it. */
export function useWatchAd(perk: 'SHARE_STYLES') {
  const entitlements = useEntitlements();
  const { data: session } = authClient.useSession();
  const [state, setState] = useState<WatchAdState>('idle');

  async function watch() {
    const before = entitlements.data;
    const userId = session?.user.id;
    if (!before || !userId) return;
    setState('watching');
    try {
      if ((await showRewardedAd({ userId, perk })) === 'CLOSED') {
        setState('closed');
        return;
      }
      setState('unlocking');
      const after = await waitForReward({ fetch: () => getEntitlements(), before });
      if (after) {
        setEntitlements(after);
        setState('unlocked');
      } else {
        setState('late');
        void refreshEntitlements();
      }
    } catch {
      setState('failed');
    }
  }

  return { offer: adOffer(entitlements.data, rewardedUnit), state, watch };
}
