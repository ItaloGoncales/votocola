import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { PublicUrlService } from './common/public-url/public-url.service.js';
import { shouldStartTunnel, startDevTunnel } from './dev/tunnel.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');

  // O .env já foi carregado pelo ConfigModule: NODE_ENV aqui reflete o arquivo.
  if (shouldStartTunnel()) {
    const url = await startDevTunnel(port);
    if (url) app.get(PublicUrlService).set(url);
  }
}
await bootstrap();
