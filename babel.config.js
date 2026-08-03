// `@env` is inlined at transform time, so whichever file is read here is what
// gets baked into the bundle. Tests read their own committed config instead of
// the developer's `.env`, which otherwise decides whether the data-layer tests
// run against the mocks or against a real backend.
const dotenvPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: dotenvPath,
        safe: false,
        allowUndefined: true,
      },
    ],
    // Must stay last: the Worklets plugin rewrites Reanimated's worklet functions.
    'react-native-worklets/plugin',
  ],
}
