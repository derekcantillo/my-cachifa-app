module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // The preset only whitelists react-native itself; these ship untranspiled
  // ESM too and need to go through Babel just the same.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-gesture-handler|react-native-reanimated|react-native-worklets|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-linear-gradient|react-native-gifted-charts|gifted-charts-core|@react-navigation)/)',
  ],
  // `setupFiles` overrides rather than merges with the preset's own list, so
  // its setup file has to be listed explicitly alongside gesture-handler's.
  setupFiles: [
    '@react-native/jest-preset/jest/setup.js',
    'react-native-gesture-handler/jestSetup.js',
  ],
}
