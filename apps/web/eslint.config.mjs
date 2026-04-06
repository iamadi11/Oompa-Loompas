import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const nextConfigs = Array.isArray(nextCoreWebVitals)
  ? nextCoreWebVitals
  : nextCoreWebVitals.default

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'public/**',
      'coverage/**',
      '*.config.mjs',
      'scripts/**',
    ],
  },
  ...nextConfigs,
]
