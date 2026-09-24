import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { buildFormatError } from './format-error.js';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

const SCHEMA_EXPOSED_ENVS = ['development', 'test'];

/** Schema/playground abertos só em development e test; qualquer outro valor (stage, prod, vazio) fecha. */
export function isSchemaExposed(nodeEnv: string | undefined): boolean {
  return SCHEMA_EXPOSED_ENVS.includes(nodeEnv ?? '');
}

/** Code-first: o schema é gerado a partir das classes; sem arquivo .graphql versionado. */
export function buildGraphqlConfig(nodeEnv: string | undefined): ApolloDriverConfig {
  const exposed = isSchemaExposed(nodeEnv);
  return {
    driver: ApolloDriver,
    autoSchemaFile: true,
    sortSchema: true,
    introspection: exposed,
    // Stacktraces só onde o schema também é exposto (o padrão do Apollo só cobre "production").
    includeStacktraceInErrorResponses: exposed,
    formatError: buildFormatError(exposed),
    playground: false,
    plugins: [
      exposed
        ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
        : ApolloServerPluginLandingPageDisabled(),
    ],
    // Expõe request/response HTTP para o rate limit (GqlThrottlerGuard).
    context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
  };
}
