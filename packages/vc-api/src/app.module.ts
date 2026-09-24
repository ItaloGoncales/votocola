import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { validateEnv } from './config/env.validation.js';
import { PublicUrlModule } from './common/public-url/public-url.module.js';
import { DatabaseModule } from './database/database.module.js';
import { buildGraphqlConfig } from './graphql/graphql.config.js';
import { globalProviders } from './global.providers.js';
import { AttributesModule } from './modules/attributes/attributes.module.js';
import { CandidatesModule } from './modules/candidates/candidates.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { LegalModule } from './modules/legal/legal.module.js';
import { PartiesModule } from './modules/parties/parties.module.js';

@Module({
  imports: [
    // Precisa vir antes do DatabaseModule: carrega o .env em process.env, que ele lê na sequência.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      inject: [ConfigService],
      driver: buildGraphqlConfig(undefined).driver,
      useFactory: (config: ConfigService) => buildGraphqlConfig(config.get('NODE_ENV')),
    }),
    // Limite geral por IP. Alto de propósito: operadoras de celular (CGNAT) põem muitos usuários
    // atrás do mesmo IP; o objetivo é só barrar robôs. Requer TRUST_PROXY atrás de proxy.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1200 }]),
    DatabaseModule.forRoot(),
    PublicUrlModule,
    AttributesModule,
    CandidatesModule,
    PartiesModule,
    HealthModule,
    LegalModule,
  ],
  providers: [...globalProviders],
})
export class AppModule {}
