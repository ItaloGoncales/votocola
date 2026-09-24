import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Data exibida como "última atualização" quando LEGAL_UPDATED_AT não está definido. */
const DEFAULT_UPDATED_AT = '24 de setembro de 2026';

const read = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../../legal/${name}.html`, import.meta.url)), 'utf8');

/** Linha do AdMob no app-ads.txt; f08c47fec0942fa0 é o ID fixo do Google na IAB. */
export function appAdsTxt(publisherId: string): string {
  if (!/^pub-\d{10,20}$/.test(publisherId))
    throw new Error('ADMOB_PUBLISHER_ID deve ser pub-<dígitos>');
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
}

/** Botões das lojas; sem URL (antes de publicar), "em breve". */
export function storeLinks(play?: string, appStore?: string): string {
  const links = [
    play ? `<a class="store" href="${play}">Google Play</a>` : null,
    appStore ? `<a class="store" href="${appStore}">App Store</a>` : null,
  ].filter(Boolean);
  return links.length ? links.join(' ') : 'Em breve na Google Play e na App Store.';
}

const escape = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Campo obrigatório ainda não configurado: aparece destacado na página. */
const TODO = '<span class="todo">[a definir]</span>';

/**
 * Termos de uso e política de privacidade, em páginas públicas (as lojas exigem URL). O texto fica
 * em `src/legal/*.html`; responsável e e-mail vêm do ambiente para não ficarem fixos no código.
 */
@Controller()
export class LegalController {
  private readonly pages: Record<'inicio' | 'termos' | 'privacidade', string>;
  private readonly appAds: string | null;

  constructor(config: ConfigService) {
    const values: Record<string, string> = {
      CONTROLLER: config.get<string>('LEGAL_CONTROLLER')
        ? escape(config.get<string>('LEGAL_CONTROLLER')!)
        : TODO,
      EMAIL: config.get<string>('LEGAL_CONTACT_EMAIL')
        ? escape(config.get<string>('LEGAL_CONTACT_EMAIL')!)
        : TODO,
      UPDATED_AT: escape(config.get<string>('LEGAL_UPDATED_AT') || DEFAULT_UPDATED_AT),
      STORES: storeLinks(config.get<string>('PLAY_STORE_URL'), config.get<string>('APP_STORE_URL')),
    };
    const publisher = config.get<string>('ADMOB_PUBLISHER_ID');
    this.appAds = publisher ? appAdsTxt(publisher) : null;
    const layout = read('layout');
    const render = (name: string, title: string) =>
      layout
        .replace('{{TITLE}}', title)
        .replace('{{BODY}}', read(name))
        // mailto com placeholder não funciona: sem e-mail, o link vira só o aviso.
        .replace(
          /<a href="mailto:\{\{EMAIL\}\}">\{\{EMAIL\}\}<\/a>/g,
          values.EMAIL === TODO ? TODO : `<a href="mailto:${values.EMAIL}">${values.EMAIL}</a>`,
        )
        .replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '');
    this.pages = {
      inicio: render('inicio', 'Monte sua colinha'),
      termos: render('termos', 'Termos de uso'),
      privacidade: render('privacidade', 'Política de privacidade'),
    };
  }

  /** Página inicial (site do desenvolvedor nas lojas e destino do link da colinha). */
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  home(): string {
    return this.pages.inicio;
  }

  /** Autoriza o AdMob a vender anúncios do app (IAB app-ads.txt); precisa estar na raiz do domínio. */
  @Get('app-ads.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  appAdsTxt(): string {
    if (!this.appAds) throw new NotFoundException();
    return this.appAds;
  }

  @Get('termos')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  terms(): string {
    return this.pages.termos;
  }

  @Get('privacidade')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  privacy(): string {
    return this.pages.privacidade;
  }
}
