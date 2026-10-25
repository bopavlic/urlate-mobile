import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { Entitlements } from '@/api/generated/model';
import { useColors } from '@/theme/appearance';
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
  { title: 'Themes and app icons', detail: 'Five more looks for the app and its icon.' },
  { title: 'No ads, ever', detail: 'Not even the ones you choose to watch.' },
];

/** One plan as a tappable card: the yearly one in the accent, with its saving. */
function PlanCard({
  plan,
  saving,
  loading,
  disabled,
  onPress,
}: {
  plan: Plan;
  saving: number | null;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const yearly = plan.period === 'year';
  const title = yearly ? 'Yearly' : 'Monthly';
  const fg = yearly ? 'text-on-accent' : 'text-ink';
  const sub = yearly ? 'text-on-accent' : 'text-muted';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={plan.price ? `${title}, ${plan.price} a ${plan.period}` : title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      className={`min-h-20 flex-row items-center justify-between gap-4 rounded-2xl px-5 py-4 active:opacity-80 ${
        yearly ? 'bg-accent' : 'bg-surface'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <View className="flex-1 gap-1">
        <Text className={`font-display text-lg ${fg}`}>{title}</Text>
        {yearly && saving ? (
          <Text className={`font-mono-bold text-xs ${sub}`}>Save {saving}%</Text>
        ) : (
          <Text className={`text-sm ${sub}`}>
            {yearly ? 'Billed once a year' : 'Billed every month'}
          </Text>
        )}
      </View>
      {loading ? (
        <ActivityIndicator color={yearly ? colors.onAccent : colors.ink} />
      ) : plan.price ? (
        <View className="items-end">
          <Text className={`font-display text-xl ${fg}`}>{plan.price}</Text>
          <Text className={`text-xs ${sub}`}>a {plan.period}</Text>
        </View>
      ) : (
        <Text className={`text-sm ${sub}`}>Price in the store</Text>
      )}
    </Pressable>
  );
}

function FinePrint({ onOpenLink }: { onOpenLink: (path: '/terms' | '/privacy') => void }) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted">
        Renews automatically until you cancel. Cancel any time in your App Store or Google Play
        settings, at least 24 hours before the current period ends. Keeping track stays free either
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
              <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-md bg-accent">
                <Text className="text-sm font-bold text-on-accent">✓</Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-display text-lg text-ink">{feature.title}</Text>
                <Text className="text-base text-muted">{feature.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {message ? <Text className="text-base text-danger">{message}</Text> : null}

        {entitlements?.premium ? (
          <View className="gap-4 rounded-2xl bg-surface p-5">
            <Text className="font-display text-lg text-ink">You’re on Premium.</Text>
            <Text className="text-base text-muted">{premiumStatus(entitlements)}</Text>
            {entitlements.premiumStore ? (
              <Button
                title={`Manage in ${storeName(entitlements.premiumStore)}`}
                variant="secondary"
                onPress={onManage}
              />
            ) : null}
          </View>
        ) : plans && plans.length > 0 ? (
          <View className="gap-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.sku}
                plan={plan}
                saving={saving}
                loading={busy === plan.sku}
                disabled={busy !== null && busy !== plan.sku}
                onPress={() => onBuy(plan)}
              />
            ))}
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
