module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['node_modules/', 'vendor/', 'android/', 'ios/', 'coverage/'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
  ],
}
