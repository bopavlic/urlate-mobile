import { ActivityIndicator, Text, View } from 'react-native';

import type { Entitlements } from '@/api/generated/model';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

import { premiumStatus, storeName } from './copy';
import { yearlySaving, type Plan } from './plans';

const FEATURES = [
  { title: 'Unlimited groups', detail: 'Free accounts can start two. Joining is always free.' },
  { title: 'Every share-card look', detail: 'Three backgrounds and six card colours.' },
  {
    title: 'Full stats',
    detail: 'Your averages, worst weekday, on-time streaks and who keeps you waiting.',
  },
  { title: 'Themes and app icons', detail: 'Four more looks for the app and its icon.' },
  { title: 'No ads, ever', detail: 'Not even the ones you choose to watch.' },
];

function FinePrint({ onOpenLink }: { onOpenLink: (path: '/terms' | '/privacy') => void }) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted">
        Renews automatically until you cancel. Cancel any time in your App Store or Google Play
        settings, at least 24 hours before the current period ends. Keeping score stays free either
        way.
      </Text>
      <View className="flex-row gap-5">
        <Text
          accessibilityRole="link"
          className="text-sm font-semibold text-ink underline"
          onPress={() => onOpenLink('/terms')}
        >
          Terms
        </Text>
        <Text
          accessibilityRole="link"
          className="text-sm font-semibold text-ink underline"
          onPress={() => onOpenLink('/privacy')}
        >
          Privacy
        </Text>
      </View>
    </View>
  );
}

/** Ur Late Premium: what it adds, the two plans at store prices, restore and manage. */
export function PremiumScreen({
  entitlements,
  plans,
  plansError,
  busy,
  message,
  onBuy,
  onRestore,
  onManage,
  onOpenLink,
}: {
  entitlements: Entitlements | undefined;
  plans: Plan[] | undefined;
  plansError: boolean;
  /** The sku being bought, 'restore', or null. */
  busy: string | null;
  message: string | null;
  onBuy: (plan: Plan) => void;
  onRestore: () => void;
  onManage: () => void;
  onOpenLink: (path: '/terms' | '/privacy') => void;
}) {
  const saving = plans ? yearlySaving(plans) : null;

  return (
    <Screen scroll>
      <View className="gap-8">
        <ScreenHeader title="Ur Late Premium" />

        <View className="gap-4">
          {FEATURES.map((feature) => (
            <View key={feature.title} className="flex-row gap-4">
              <View className="mt-1 h-6 w-[18px] rotate-6 rounded-[3px] bg-accent" />
              <View className="flex-1 gap-0.5">
                <Text className="font-display-bold text-2xl text-ink">{feature.title}</Text>
                <Text className="text-base text-muted">{feature.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {message ? <Text className="text-base text-danger">{message}</Text> : null}

        {entitlements?.premium ? (
          <View className="gap-4 rounded-2xl bg-surface p-5">
            <Text className="font-display-bold text-2xl text-ink">You’re on Premium.</Text>
            <Text className="text-base text-muted">{premiumStatus(entitlements)}</Text>
            <Button
              title={`Manage in ${storeName(entitlements.premiumStore)}`}
              variant="secondary"
              onPress={onManage}
            />
          </View>
        ) : plans && plans.length > 0 ? (
          <View className="gap-3">
            {plans.map((plan) => {
              const label =
                plan.period === 'year'
                  ? `Yearly, ${plan.price} a year`
                  : `Monthly, ${plan.price} a month`;
              return (
                <View key={plan.sku} className="gap-1">
                  <Button
                    title={label}
                    variant={plan.period === 'year' ? 'primary' : 'secondary'}
                    loading={busy === plan.sku}
                    disabled={busy !== null && busy !== plan.sku}
                    onPress={() => onBuy(plan)}
                  />
                  {plan.period === 'year' && saving ? (
                    <Text className="text-center text-sm font-semibold text-muted">
                      Save {saving}%
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : plansError ? (
          <Text className="text-base text-muted">
            Couldn’t load prices from the store. Check your connection and try again.
          </Text>
        ) : (
          <ActivityIndicator />
        )}

        <Button
          title="Restore purchases"
          variant="ghost"
          loading={busy === 'restore'}
          onPress={onRestore}
        />
        <FinePrint onOpenLink={onOpenLink} />
      </View>
    </Screen>
  );
}
