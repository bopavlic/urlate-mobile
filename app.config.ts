import type { ConfigContext, ExpoConfig } from 'expo/config';

// Set GOOGLE_IOS_URL_SCHEME (the reversed iOS client ID) to enable Google sign-in in native
// builds; it is baked into the iOS app, so rebuild the dev client after changing it.
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
const easProjectId = process.env.EAS_PROJECT_ID;

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
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-secure-store',
    'expo-apple-authentication',
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
    ...(googleIosUrlScheme
      ? [['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }] as [
          string,
          unknown,
        ]]
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
