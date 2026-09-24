import { ValidationPipe, type Provider } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { GqlThrottlerGuard } from './common/http/gql-throttler.guard.js';

export const throttlerGuardProvider: Provider = { provide: APP_GUARD, useClass: GqlThrottlerGuard };

export const validationPipeProvider: Provider = {
  provide: APP_PIPE,
  useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
};

/** Sem usuários nem autenticação: tudo é público, com rate limit por IP e validação de inputs. */
export const globalProviders: Provider[] = [throttlerGuardProvider, validationPipeProvider];
