import { router } from 'expo-router';

import { useGetMyStats } from '@/api/generated/endpoints/me/me';
import { useWatchAd } from '@/features/ads/useWatchAd';
import { useEntitlements } from '@/features/premium/queries';
import { StatsScreen } from '@/features/stats/StatsScreen';

// Weekdays and day streaks are counted in the phone's time zone.
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function StatsRoute() {
  const entitlements = useEntitlements();
  // Refetched when Premium or an ad unlocks the full stats.
  const fullStats = entitlements.data?.features.fullStats ?? false;
  const stats = useGetMyStats(
    { tz: timeZone },
    { query: { queryKey: ['stats', timeZone, fullStats] } },
  );
  const ad = useWatchAd('FULL_STATS');

  return (
    <StatsScreen
      stats={stats.data}
      loading={stats.isPending}
      error={stats.isError}
      onRetry={() => void stats.refetch()}
      onGetPremium={() => router.push('/premium')}
      adOffer={ad.offer}
      adState={ad.state}
      onWatchAd={() => void ad.watch()}
    />
  );
}
