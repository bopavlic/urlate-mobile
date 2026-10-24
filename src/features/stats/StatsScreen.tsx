import { ActivityIndicator, Text, View } from 'react-native';

import type { FullStats, Stats } from '@/api/generated/model';
import type { AdOffer } from '@/features/ads/offer';
import { WatchAdButton, type WatchAdState } from '@/features/ads/WatchAdButton';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { daysText, durationText, timesText, weekdayText } from './copy';

function Total({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 gap-1 rounded-2xl bg-surface p-4">
      <Text className="font-display text-4xl text-ink" adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-sm text-muted">{label}</Text>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-baseline justify-between gap-4 py-3">
      <Text className="flex-1 text-base text-muted">{label}</Text>
      <Text className="text-lg font-semibold text-ink">{value}</Text>
    </View>
  );
}

function People({ title, people }: { title: string; people: FullStats['keepsYouWaiting'] }) {
  if (people.length === 0) return null;
  return (
    <View className="gap-1">
      <Text className="font-display text-lg text-ink">{title}</Text>
      {people.map((person, index) => (
        <View key={`${person.name}-${index}`}>
          {index > 0 ? <View className="h-px bg-line" /> : null}
          <Fact
            label={person.name}
            value={`${durationText(person.minutes)}, ${timesText(person.count)}`}
          />
        </View>
      ))}
    </View>
  );
}

function FullStatsView({ full }: { full: FullStats }) {
  return (
    <View className="gap-8">
      <View>
        {full.worstWeekday ? (
          <Text className="font-display text-lg text-ink">
            Most often late on {weekdayText(full.worstWeekday.weekday)} (
            {timesText(full.worstWeekday.lateCount)})
          </Text>
        ) : (
          <Text className="font-display text-lg text-ink">Never late. Keep it that way.</Text>
        )}
        {full.averageLateMinutes !== null ? (
          <Fact
            label="When you’re late, on average"
            value={durationText(full.averageLateMinutes)}
          />
        ) : null}
        {full.averageWaitMinutes !== null ? (
          <Fact label="When you wait, on average" value={durationText(full.averageWaitMinutes)} />
        ) : null}
        <Fact
          label="Longest stretch without being late"
          value={daysText(full.longestOnTimeStreakDays)}
        />
        <Fact label="Current stretch" value={daysText(full.currentOnTimeStreakDays)} />
      </View>
      <People title="Who keeps you waiting" people={full.keepsYouWaiting} />
      <People title="Who you keep waiting" people={full.youKeepWaiting} />
    </View>
  );
}

/** Your lateness across everyone you keep track of: totals for everyone, the rest with Premium or an ad. */
export function StatsScreen({
  stats,
  loading,
  error,
  onRetry,
  onGetPremium,
  adOffer,
  adState,
  onWatchAd,
}: {
  stats: Stats | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onGetPremium: () => void;
  adOffer: AdOffer;
  adState: WatchAdState;
  onWatchAd: () => void;
}) {
  return (
    <Screen scroll>
      <View className="gap-8">
        <ScreenHeader title="Your stats" />
        {stats ? (
          <>
            <View className="flex-row gap-3">
              <Total
                value={durationText(stats.totals.waitedMinutes)}
                label={`Waited for others, ${timesText(stats.totals.waitedCount)}`}
              />
              <Total
                value={durationText(stats.totals.lateMinutes)}
                label={`Kept others waiting, ${timesText(stats.totals.lateCount)}`}
              />
            </View>
            {stats.full ? (
              <FullStatsView full={stats.full} />
            ) : (
              <View className="gap-3 rounded-2xl bg-surface p-5">
                <Text className="font-display text-lg text-ink">There’s more to know.</Text>
                <Text className="text-base text-muted">
                  Your averages, worst weekday, on-time streaks and who keeps you waiting come with
                  Premium.
                </Text>
                <Button title="Get Premium" onPress={onGetPremium} />
                <WatchAdButton offer={adOffer} state={adState} onWatch={onWatchAd} />
              </View>
            )}
          </>
        ) : error && !loading ? (
          <View className="items-center gap-4 pt-8">
            <Text className="text-center text-lg text-danger">
              Couldn’t load your stats. Check your connection.
            </Text>
            <Button title="Try again" variant="secondary" onPress={onRetry} />
          </View>
        ) : (
          <ActivityIndicator className="mt-16" />
        )}
      </View>
    </Screen>
  );
}
