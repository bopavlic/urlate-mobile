import { defineConfig } from 'orval';

// The API contract is urlate-backend/openapi.json (also served at /v1/openapi.json).
// Regenerate with `pnpm api:generate` whenever the backend's routes change.
const infinite = { query: { useInfinite: true, useInfiniteQueryParam: 'cursor' } };

export default defineConfig({
  urlate: {
    input: { target: process.env.OPENAPI_PATH ?? '../urlate-backend/openapi.json' },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/endpoints',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: { path: 'src/api/client.ts', name: 'customInstance' },
        operations: {
          listLedgers: infinite,
          getLedgerHistory: infinite,
        },
      },
    },
  },
});
