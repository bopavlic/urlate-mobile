import type { ConfigContext, ExpoConfig } from 'expo/config';

// Set GOOGLE_IOS_URL_SCHEME (the reversed iOS client ID) to enable Google sign-in in native
// builds; it is baked into the iOS app, so rebuild the dev client after changing it.
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
const easProjectId = process.env.EAS_PROJECT_ID;
// Android push goes through Firebase Cloud Messaging: path to the Firebase project's
// google-services.json (kept out of git). iOS push needs no file: EAS holds the APNs key.
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
// AdMob app ids (AdMob → Apps → App settings). Unset = Google's sample apps, which only ever
// serve test ads, so development builds never touch the real account.
const admobIosAppId = process.env.ADMOB_IOS_APP_ID ?? 'ca-app-pub-3940256099942544~1458002511';
const admobAndroidAppId =
  process.env.ADMOB_ANDROID_APP_ID ?? 'ca-app-pub-3940256099942544~3347511713';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Ur Late',
  slug: 'urlate',
  scheme: 'urlate',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android'],
  ios: {
    bundleIdentifier: 'app.urlate',
    icon: './assets/expo.icon',
    supportsTablet: false,
    usesAppleSignIn: true,
    // Universal links: urlate.app/i/… and /s/… open the app (the site serves the AASA file).
    associatedDomains: ['applinks:urlate.app'],
  },
  android: {
    package: 'app.urlate',
    adaptiveIcon: {
      backgroundColor: '#FFCC1A',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    ...(googleServicesFile ? { googleServicesFile } : {}),
    // App links: verified against urlate.app/.well-known/assetlinks.json.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'https', host: 'urlate.app', pathPrefix: '/i/' },
          { scheme: 'https', host: 'urlate.app', pathPrefix: '/s/' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-secure-store',
    'expo-apple-authentication',
    // Push notifications (activity). The Android icon tint matches the accent.
    ['expo-notifications', { color: '#FFCC1A' }],
    [
      'expo-image-picker',
      {
        photosPermission: 'Ur Late uses your photos so you can pick a profile picture.',
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFCC1A',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    // Premium subscriptions through StoreKit 2 and Play Billing.
    'expo-iap',
    // Rewarded ads, only when someone taps "Watch an ad". The SDK starts after consent.
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: admobIosAppId,
        androidAppId: admobAndroidAppId,
        delayAppMeasurementInit: true,
        skAdNetworkItems: ['cstr6suwn9.skadnetwork'],
      },
    ],
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission:
          'Only for the ads you choose to watch: lets them be more relevant to you. Ur Late works the same either way.',
      },
    ],
    ...(googleIosUrlScheme
      ? [
          ['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }] as [
            string,
            unknown,
          ],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
  },
});
