import { Query, Resolver } from '@nestjs/graphql';
import { Health } from './health.model.js';

@Resolver(() => Health)
export class HealthResolver {
  @Query(() => Health)
  health(): Health {
    return { status: 'ok', uptime: Math.floor(process.uptime()) };
  }
}
