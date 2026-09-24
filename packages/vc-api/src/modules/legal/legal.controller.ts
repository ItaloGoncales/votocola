import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Data exibida como "última atualização" quando LEGAL_UPDATED_AT não está definido. */
const DEFAULT_UPDATED_AT = '24 de setembro de 2026';

const read = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../../legal/${name}.html`, import.meta.url)), 'utf8');

const escape = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Campo obrigatório ainda não configurado: aparece destacado na página. */
const TODO = '<span class="todo">[a definir]</span>';

/**
 * Termos de uso e política de privacidade, em páginas públicas (as lojas exigem URL). O texto fica
 * em `src/legal/*.html`; responsável e e-mail vêm do ambiente para não ficarem fixos no código.
 */
@Controller()
export class LegalController {
  private readonly pages: Record<'termos' | 'privacidade', string>;

  constructor(config: ConfigService) {
    const values: Record<string, string> = {
      CONTROLLER: config.get<string>('LEGAL_CONTROLLER')
        ? escape(config.get<string>('LEGAL_CONTROLLER')!)
        : TODO,
      EMAIL: config.get<string>('LEGAL_CONTACT_EMAIL')
        ? escape(config.get<string>('LEGAL_CONTACT_EMAIL')!)
        : TODO,
      UPDATED_AT: escape(config.get<string>('LEGAL_UPDATED_AT') || DEFAULT_UPDATED_AT),
    };
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
      termos: render('termos', 'Termos de uso'),
      privacidade: render('privacidade', 'Política de privacidade'),
    };
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
