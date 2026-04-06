// Global test setup — @oompa/db is aliased to __mocks__/db.ts in vitest.config.ts
process.env['SESSION_SECRET'] = 'test-session-secret-min-32-chars!!'
