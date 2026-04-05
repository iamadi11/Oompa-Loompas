/** ESLint config for @oompa/api — type-aware rules need project path. */
module.exports = {
  root: true,
  extends: ['../../packages/config/eslint/base.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist', 'node_modules'],
  overrides: [
    {
      files: ['**/__tests__/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    {
      files: ['src/routes/**/index.ts', 'src/server.ts'],
      rules: {
        '@typescript-eslint/require-await': 'off',
      },
    },
  ],
}
