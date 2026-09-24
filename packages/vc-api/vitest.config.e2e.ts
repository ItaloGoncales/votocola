import { createRequire } from 'node:module';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Ver o comentário em vitest.config.ts sobre o alias do `graphql`.
const graphqlCjs = createRequire(import.meta.url).resolve('graphql');

export default defineConfig({
  resolve: { alias: [{ find: /^graphql$/, replacement: graphqlCjs }] },
  plugins: [tsconfigPaths(), swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
