import { PREMIUM_SKUS, purchaseErrorMessage, toPlans, verifyBody, yearlySaving } from './plans';

const monthly = {
  id: 'app.urlate.premium.monthly',
  displayPrice: '$2.99',
  price: 2.99,
  platform: 'ios' as const,
};
const yearly = {
  id: 'app.urlate.premium.yearly',
  displayPrice: '$19.99',
  price: 19.99,
  platform: 'ios' as const,
};

describe('toPlans', () => {
  it('lists the yearly plan first, with store prices as the store formats them', () => {
    expect(toPlans([monthly, yearly])).toEqual([
      {
        sku: 'app.urlate.premium.yearly',
        period: 'year',
        price: '$19.99',
        amount: 19.99,
        offerToken: null,
      },
      {
        sku: 'app.urlate.premium.monthly',
        period: 'month',
        price: '$2.99',
        amount: 2.99,
        offerToken: null,
      },
    ]);
  });

  it('keeps the base-plan offer token Google Play needs to buy', () => {
    const android = {
      ...monthly,
      platform: 'android' as const,
      subscriptionOffers: [{ offerTokenAndroid: 'token-base' }],
    };
    expect(toPlans([android])[0]?.offerToken).toBe('token-base');
  });

  it('ignores products that are not premium', () => {
    expect(toPlans([{ ...monthly, id: 'app.urlate.coins' }])).toEqual([]);
    expect(PREMIUM_SKUS).toEqual(['app.urlate.premium.monthly', 'app.urlate.premium.yearly']);
  });
});

describe('yearlySaving', () => {
  it('compares a year of monthly payments with the yearly price', () => {
    expect(yearlySaving(toPlans([monthly, yearly]))).toBe(44);
    expect(yearlySaving(toPlans([yearly]))).toBeNull();
  });
});

describe('verifyBody', () => {
  it('sends Apple’s signed transaction or Google’s purchase token', () => {
    expect(verifyBody({ store: 'apple', purchaseToken: 'eyJ.jws' }, 'ios')).toEqual({
      store: 'APPLE',
      signedTransaction: 'eyJ.jws',
    });
    expect(verifyBody({ store: 'google', purchaseToken: 'play-token' }, 'android')).toEqual({
      store: 'GOOGLE',
      purchaseToken: 'play-token',
    });
  });

  it('has nothing to send without a token', () => {
    expect(verifyBody({ store: 'apple', purchaseToken: null }, 'ios')).toBeNull();
  });
});

describe('purchaseErrorMessage', () => {
  it('stays quiet when someone just closes the store sheet', () => {
    expect(purchaseErrorMessage('user-cancelled')).toBeNull();
  });

  it('explains the rest', () => {
    expect(purchaseErrorMessage('network-error')).toBe(
      'Couldn’t reach the store. Check your connection and try again.',
    );
    expect(purchaseErrorMessage('something-else')).toBe(
      'The purchase didn’t go through. You haven’t been charged.',
    );
  });
});
