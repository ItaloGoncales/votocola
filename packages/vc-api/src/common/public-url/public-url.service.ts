import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * URL pública da API (base das URLs de fotos e planos). Vem de `PUBLIC_URL`, mas em
 * desenvolvimento o túnel (`src/dev/tunnel.ts`) a troca pela URL dele depois do boot.
 */
@Injectable()
export class PublicUrlService {
  private value: string;

  constructor(config: ConfigService) {
    this.value = config.getOrThrow<string>('PUBLIC_URL');
  }

  get(): string {
    return this.value;
  }

  set(url: string): void {
    this.value = url.replace(/\/+$/, '');
  }
}
