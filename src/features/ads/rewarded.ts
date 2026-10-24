import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

import { rewardedUnitId } from './offer';

// Google Mobile Ads, touched only when someone taps "Watch an ad". Before the first ad: Google's
// consent form where the law needs one (EU, UK), then Apple's tracking prompt on iOS. Ads stay
// non-personalised unless the consent form says otherwise.

export const rewardedUnit = rewardedUnitId({
  dev: __DEV__,
  platform: Platform.OS === 'ios' ? 'ios' : 'android',
  ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
  android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
  test: TestIds.REWARDED,
});

export class NoConsentError extends Error {}

let initialized: Promise<unknown> | null = null;

async function prepare(): Promise<{ personalised: boolean }> {
  // Shows the form only when it's required and not yet answered.
  const consent = await AdsConsent.gatherConsent();
  if (!consent.canRequestAds) throw new NoConsentError('Ads need a consent answer first');
  if (Platform.OS === 'ios' && (await getTrackingPermissionsAsync()).status === 'undetermined') {
    await requestTrackingPermissionsAsync();
  }
  initialized ??= mobileAds().initialize();
  await initialized;
  const choices = await AdsConsent.getUserChoices();
  return { personalised: choices.selectPersonalisedAds };
}

/**
 * Loads and shows one rewarded ad. 'EARNED' when it was watched to the end; the reward
 * itself is granted by AdMob's server-side callback to the API, tagged with the account.
 */
export async function showRewardedAd(input: {
  userId: string;
  perk: string;
}): Promise<'EARNED' | 'CLOSED'> {
  if (!rewardedUnit) throw new Error('No rewarded ad unit is set up');
  const { personalised } = await prepare();
  const ad = RewardedAd.createForAdRequest(rewardedUnit, {
    requestNonPersonalizedAdsOnly: !personalised,
    serverSideVerificationOptions: { userId: input.userId, customData: input.perk },
  });
  return new Promise((resolve, reject) => {
    let earned = false;
    const stop = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        ad.show().catch(fail);
      }),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        cleanUp();
        resolve(earned ? 'EARNED' : 'CLOSED');
      }),
      ad.addAdEventListener(AdEventType.ERROR, fail),
    ];
    function cleanUp() {
      for (const unsubscribe of stop) unsubscribe();
    }
    function fail(error: unknown) {
      cleanUp();
      reject(error instanceof Error ? error : new Error('The ad failed'));
    }
    ad.load();
  });
}

/** Whether the law needs an "Ad privacy choices" entry (EU, UK); asks Google, shows nothing. */
export async function privacyChoicesRequired(): Promise<boolean> {
  const info = await AdsConsent.requestInfoUpdate();
  return (
    info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
  );
}

export async function showPrivacyChoices(): Promise<void> {
  await AdsConsent.showPrivacyOptionsForm();
}
