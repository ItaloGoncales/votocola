import { createRequire } from 'node:module';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// O pacote `graphql` tem builds CJS e ESM; sem este alias o código do projeto (ESM) e o
// @nestjs/graphql (CJS) carregariam duas cópias e o `instanceof` do Nest falharia com scalars e
// erros customizados. Em produção (Node ESM) as duas partes já usam o mesmo `index.js`.
const graphqlCjs = createRequire(import.meta.url).resolve('graphql');

export default defineConfig({
  resolve: { alias: [{ find: /^graphql$/, replacement: graphqlCjs }] },
  // SWC emite metadata de decorators (necessária para injeção de dependência do Nest);
  // o esbuild padrão do vitest não emite.
  plugins: [tsconfigPaths(), swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
