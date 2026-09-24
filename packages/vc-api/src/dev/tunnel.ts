import { Logger } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { existsSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Só estes ambientes sobem túnel; stage/produção nunca (e `TUNNEL=false` desliga em qualquer um). */
const TUNNEL_ENVS = ['development', 'test'];
const URL_TIMEOUT_MS = 30_000;
const TRYCLOUDFLARE_URL = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
/** Estado do túnel entre reinícios da API (`nest --watch`): pid, porta e URL. Fora do git. */
const STATE_FILE = here('../../.tunnel.json');
const LOG_FILE = here('../../.tunnel.log');
/** `.env.local` do app (tem precedência sobre o `.env` no Expo e fica fora do git). */
const APP_ENV_FILE = here('../../../vc-app/.env.local');

const logger = new Logger('Tunnel');

interface TunnelState {
  pid: number;
  port: string;
  url: string;
}

export const shouldStartTunnel = (env: NodeJS.ProcessEnv = process.env): boolean =>
  TUNNEL_ENVS.includes(env.NODE_ENV ?? '') && env.TUNNEL !== 'false';

/** Troca (ou acrescenta) `KEY=value` num arquivo .env, preservando as outras linhas. */
export function upsertEnvLine(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content}${content && !content.endsWith('\n') ? '\n' : ''}${line}\n`;
}

/** Aponta o app (Expo) para a API do túnel. Só escreve se a URL mudou. */
function writeAppEnv(apiUrl: string): void {
  if (!existsSync(join(APP_ENV_FILE, '..'))) return;
  const current = existsSync(APP_ENV_FILE) ? readFileSync(APP_ENV_FILE, 'utf8') : '';
  const header = current
    ? ''
    : '# Gerado pela API em desenvolvimento (src/dev/tunnel.ts). Não versionar.\n';
  const next = header + upsertEnvLine(current, 'EXPO_PUBLIC_API_URL', `${apiUrl}/graphql`);
  if (next === current) return;
  writeFileSync(APP_ENV_FILE, next);
  logger.warn(`URL nova gravada em ${APP_ENV_FILE}: reinicie o Expo com --clear`);
}

const isAlive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

async function responds(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(8_000) });
    return res.ok;
  } catch {
    return false;
  }
}

function readState(): TunnelState | null {
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as TunnelState;
  } catch {
    return null;
  }
}

/** Encerra o túnel persistente, se houver (`yarn api tunnel:stop`). */
export function stopTunnel(): void {
  const state = readState();
  if (state && isAlive(state.pid)) process.kill(state.pid);
  rmSync(STATE_FILE, { force: true });
}

async function waitForUrl(): Promise<string> {
  const deadline = Date.now() + URL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const match = existsSync(LOG_FILE)
      ? readFileSync(LOG_FILE, 'utf8').match(TRYCLOUDFLARE_URL)
      : null;
    if (match) return match[0];
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`sem URL após ${URL_TIMEOUT_MS / 1000} s (veja ${LOG_FILE})`);
}

/**
 * Garante um túnel rápido da Cloudflare (trycloudflare.com, sem conta) para a porta da API, para
 * o celular alcançá-la atrás do NAT do WSL/Docker. O `cloudflared` roda desacoplado da API: nos
 * reinícios do `--watch` o mesmo túnel (e a mesma URL) é reaproveitado. Devolve a URL, ou null se
 * não conseguir (a API continua funcionando localmente).
 */
export async function startDevTunnel(port: number | string): Promise<string | null> {
  try {
    const previous = readState();
    if (previous && String(previous.port) === String(port) && isAlive(previous.pid)) {
      if (await responds(previous.url)) {
        logger.log(`Reaproveitando túnel: ${previous.url}/graphql`);
        writeAppEnv(previous.url);
        return previous.url;
      }
      process.kill(previous.pid);
    }

    // Import dinâmico: `cloudflared` é devDependency e não existe na imagem de produção.
    const { bin, install } = await import('cloudflared');
    if (!existsSync(bin)) {
      logger.log('Baixando o binário do cloudflared (só na primeira vez)...');
      await install(bin);
    }

    const log = openSync(LOG_FILE, 'w');
    const child = spawn(bin, ['tunnel', '--no-autoupdate', '--url', `http://localhost:${port}`], {
      detached: true,
      stdio: ['ignore', log, log],
    });
    child.unref();
    const url = await waitForUrl();
    writeFileSync(STATE_FILE, JSON.stringify({ pid: child.pid, port: String(port), url }));

    logger.log(`API pública em ${url}/graphql (túnel persistente; pare com: yarn api tunnel:stop)`);
    writeAppEnv(url);
    return url;
  } catch (error) {
    logger.warn(`Túnel não subiu (${String(error)}); a API segue só local.`);
    return null;
  }
}
