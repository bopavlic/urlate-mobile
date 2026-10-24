import * as IAP from 'expo-iap';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { verifyPurchase } from '@/api/generated/endpoints/premium/premium';

import { PREMIUM_SKUS, purchaseErrorMessage, toPlans, verifyBody, type Plan } from './plans';
import { setEntitlements } from './queries';

// expo-iap (StoreKit 2, Play Billing) glue. A purchase only counts once the API has checked it
// with the store; until then the transaction stays unfinished, so the store hands it back on
// the next launch and nothing paid for is ever lost.

const platform = Platform.OS === 'ios' ? 'ios' : 'android';

type Listener = (event: { ok: true } | { ok: false; message: string | null }) => void;
const listeners = new Set<Listener>();

/** The Premium screen hears how a purchase it started ended. */
export function onPurchaseResult(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event: Parameters<Listener>[0]): void {
  for (const listener of listeners) listener(event);
}

let connected: Promise<boolean> | null = null;
function connect(): Promise<boolean> {
  connected ??= IAP.initConnection().catch((err: unknown) => {
    connected = null;
    throw err;
  });
  return connected;
}

export async function loadPlans(): Promise<Plan[]> {
  await connect();
  const products = await IAP.fetchProducts({ skus: [...PREMIUM_SKUS], type: 'subs' });
  return toPlans((products ?? []) as Parameters<typeof toPlans>[0]);
}

/** Opens the store's sheet; the result arrives through the purchase listener. */
export async function buyPlan(plan: Plan, accountId: string): Promise<void> {
  await connect();
  await IAP.requestPurchase({
    type: 'subs',
    request: {
      apple: { sku: plan.sku },
      google: {
        skus: [plan.sku],
        // Lets the API match Play's notifications to this account.
        obfuscatedAccountId: accountId,
        subscriptionOffers: plan.offerToken ? [{ sku: plan.sku, offerToken: plan.offerToken }] : [],
      },
    },
  });
}

/** Checks a purchase with the API, then tells the store it has been delivered. */
async function confirm(purchase: IAP.Purchase): Promise<void> {
  if (!(PREMIUM_SKUS as readonly string[]).includes(purchase.productId)) return;
  if (purchase.purchaseState === 'pending') return;
  const body = verifyBody(purchase, platform);
  if (!body) return;
  setEntitlements(await verifyPurchase(body));
  await IAP.finishTransaction({ purchase, isConsumable: false });
}

/** "Restore purchases": hands every premium purchase in this store account to the API. */
export async function restorePurchases(): Promise<void> {
  await connect();
  if (platform === 'ios') await IAP.restorePurchases();
  const purchases = await IAP.getAvailablePurchases();
  for (const purchase of purchases) await confirm(purchase);
}

export async function manageSubscription(sku: string | undefined): Promise<void> {
  await IAP.deepLinkToSubscriptions({ packageNameAndroid: 'app.urlate', skuAndroid: sku ?? null });
}

/** Mounted while signed in: finishes purchases, including ones left over from last time. */
export function usePurchaseUpdates(): void {
  useEffect(() => {
    const updated = IAP.purchaseUpdatedListener((purchase) => {
      confirm(purchase)
        .then(() => emit({ ok: true }))
        .catch(() =>
          emit({
            ok: false,
            message:
              'Paid, but we couldn’t confirm it yet. It will finish next time you open Ur Late.',
          }),
        );
    });
    const failed = IAP.purchaseErrorListener((error) => {
      emit({ ok: false, message: purchaseErrorMessage(error.code) });
    });
    // Starting the connection also makes the store redeliver unfinished transactions.
    connect().catch(() => undefined);
    return () => {
      updated.remove();
      failed.remove();
    };
  }, []);
}
