/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'api-lib-must-not-import-routes',
      severity: 'error',
      comment: 'Keep route handlers as HTTP adapters; shared lib code must stay route-agnostic.',
      from: { path: '^apps/api/src/lib/' },
      to: { path: '^apps/api/src/routes/' },
    },
    {
      name: 'api-routes-must-not-cross-import',
      severity: 'error',
      comment: 'Each route module should depend on lib/plugins, not other route modules.',
      from: { path: '^apps/api/src/routes/[^/]+/' },
      to: { path: '^apps/api/src/routes/[^/]+/', pathNot: '^apps/api/src/routes/[^/]+/' },
    },
    {
      name: 'web-components-must-not-import-app-routes',
      severity: 'error',
      comment: 'Shared components should not depend directly on Next app route files.',
      from: { path: '^apps/web/components/' },
      to: { path: '^apps/web/app/' },
    },
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },
    doNotFollow: {
      path: 'node_modules',
    },
    includeOnly: '^apps/(api/src|web)',
    exclude: {
      path: '\\.test\\.|__tests__/|\\.d\\.ts$',
    },
  },
}
