import { Injectable, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/** ThrottlerGuard que entende o contexto GraphQL (o padrão só lê o contexto HTTP). */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected override getRequestResponse(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      const { req, res } = GqlExecutionContext.create(context).getContext();
      return { req, res };
    }
    return super.getRequestResponse(context);
  }
}
