import type { VerifyPurchaseBody } from '@/api/generated/model';

// Premium is the same two subscriptions in both stores (urlate-backend/src/domain/subscription.ts).
export const PREMIUM_SKUS = ['app.urlate.premium.monthly', 'app.urlate.premium.yearly'] as const;

export interface Plan {
  sku: string;
  period: 'month' | 'year';
  /** As the store formats it, in the buyer's currency. */
  price: string;
  amount: number | null;
  /** Google Play buys a subscription through one of its offers: the base plan's. */
  offerToken: string | null;
}

/** The parts of an expo-iap subscription product used here. */
export interface StoreProduct {
  id: string;
  displayPrice: string;
  price?: number | null;
  subscriptionOffers?: { offerTokenAndroid?: string | null }[] | null;
}

export function toPlans(products: readonly StoreProduct[]): Plan[] {
  return products
    .filter((product) => (PREMIUM_SKUS as readonly string[]).includes(product.id))
    .map((product) => ({
      sku: product.id,
      period: product.id.endsWith('.yearly') ? ('year' as const) : ('month' as const),
      price: product.displayPrice,
      amount: product.price ?? null,
      offerToken:
        product.subscriptionOffers?.find((offer) => offer.offerTokenAndroid)?.offerTokenAndroid ??
        null,
    }))
    .sort((a, b) => (a.period === b.period ? 0 : a.period === 'year' ? -1 : 1));
}

/** Percent saved by paying yearly, or null when either price is unknown. */
export function yearlySaving(plans: readonly Plan[]): number | null {
  const month = plans.find((plan) => plan.period === 'month')?.amount;
  const year = plans.find((plan) => plan.period === 'year')?.amount;
  if (!month || !year) return null;
  return Math.round((1 - year / (month * 12)) * 100);
}

/** What the API needs to check a purchase: Apple's JWS, or Google's purchase token. */
export function verifyBody(
  purchase: { purchaseToken?: string | null; store?: string },
  platform: 'ios' | 'android',
): VerifyPurchaseBody | null {
  const token = purchase.purchaseToken;
  if (!token) return null;
  return platform === 'ios'
    ? { store: 'APPLE', signedTransaction: token }
    : { store: 'GOOGLE', purchaseToken: token };
}

const ERRORS: Record<string, string> = {
  'network-error': 'Couldn’t reach the store. Check your connection and try again.',
  'service-error': 'The store isn’t answering right now. Try again in a bit.',
  'already-owned': 'You already have Premium. Try Restore purchases.',
  'deferred-payment': 'Waiting for approval. Premium starts once the purchase is approved.',
};

/** Null for a cancelled purchase: closing the sheet isn't an error. */
export function purchaseErrorMessage(code: string | undefined): string | null {
  if (code === 'user-cancelled') return null;
  return (code && ERRORS[code]) || 'The purchase didn’t go through. You haven’t been charged.';
}
