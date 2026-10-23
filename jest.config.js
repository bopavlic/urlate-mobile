module.exports = {
  preset: 'jest-expo',
  // pnpm nests packages under node_modules/.pnpm; React Native packages ship untranspiled code.
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-router|react-navigation|@react-navigation/.*|nativewind|react-native-css-interop|better-auth|@better-auth/.*|@tanstack/.*|standard-navigation))',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/', '/.superpowers/'],
};
