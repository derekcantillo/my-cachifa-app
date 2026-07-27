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
    {
      // Data access must go through src/hooks — never straight to a repository.
      files: ['src/screens/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/api/repositories/**', '@/api/repositories/**'],
                message:
                  'Import data through a hook in @/hooks instead of a repository directly.',
              },
              {
                group: ['**/api/repositoryFactory', '@/api/repositoryFactory'],
                message:
                  'Import data through a hook in @/hooks instead of the repository factory.',
              },
            ],
          },
        ],
      },
    },
  ],
}
