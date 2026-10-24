import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

import { getEntitlements } from '@/api/generated/endpoints/premium/premium';
import { purchaseErrorMessage } from '@/features/premium/plans';
import { PremiumScreen } from '@/features/premium/PremiumScreen';
import { setEntitlements, useEntitlements } from '@/features/premium/queries';
import {
  buyPlan,
  loadPlans,
  manageSubscription,
  onPurchaseResult,
  restorePurchases,
} from '@/features/premium/store';
import { authClient } from '@/lib/auth';
import { webUrl } from '@/lib/config';

export default function PremiumRoute() {
  const entitlements = useEntitlements();
  const plans = useQuery({
    queryKey: ['premium-plans'],
    queryFn: loadPlans,
    staleTime: 10 * 60_000,
  });
  const { data: session } = authClient.useSession();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // The store answers through the purchase listener, not the buy call.
  useEffect(
    () =>
      onPurchaseResult((result) => {
        setBusy(null);
        if (!result.ok) setMessage(result.message);
      }),
    [],
  );

  return (
    <PremiumScreen
      entitlements={entitlements.data}
      plans={plans.data}
      plansError={plans.isError}
      busy={busy}
      message={message}
      onBuy={(plan) => {
        if (!session) return;
        setMessage(null);
        setBusy(plan.sku);
        buyPlan(plan, session.user.id).catch((err: unknown) => {
          setBusy(null);
          setMessage(purchaseErrorMessage((err as { code?: string }).code));
        });
      }}
      onRestore={() => {
        setMessage(null);
        setBusy('restore');
        restorePurchases()
          .then(() => getEntitlements())
          .then((after) => {
            setEntitlements(after);
            if (!after.premium) setMessage('No Premium subscription found for this store account.');
          })
          .catch(() => setMessage('Couldn’t reach the store. Check your connection and try again.'))
          .finally(() => setBusy(null));
      }}
      onManage={() => void manageSubscription(undefined)}
      onOpenLink={(path) => void WebBrowser.openBrowserAsync(`${webUrl}${path}`)}
    />
  );
}
