import { Global, Module } from '@nestjs/common';
import { PublicUrlService } from './public-url.service.js';

@Global()
@Module({ providers: [PublicUrlService], exports: [PublicUrlService] })
export class PublicUrlModule {}
