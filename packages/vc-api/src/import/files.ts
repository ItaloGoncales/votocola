import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Aceita um .zip (extraído num diretório temporário), um diretório ou um arquivo. */
export function resolveInput(path: string): string {
  if (!path.toLowerCase().endsWith('.zip')) return path;
  const dir = mkdtempSync(join(tmpdir(), 'votocerto-'));
  execFileSync('unzip', ['-q', '-o', path, '-d', dir]);
  return dir;
}

/** Lista recursivamente os arquivos com as extensões dadas (ou o próprio arquivo). */
export function listFiles(path: string, extensions: string[]): string[] {
  const matches = (file: string) => extensions.some((ext) => file.toLowerCase().endsWith(ext));
  if (statSync(path).isFile()) return matches(path) ? [path] : [];
  return readdirSync(path, { recursive: true, encoding: 'utf8' })
    .map((name) => join(path, name))
    .filter((file) => matches(file) && statSync(file).isFile())
    .sort();
}

/** `SQ_CANDIDATO` no nome do arquivo, ex.: `FSP250001234567_div.jpg` -> `250001234567`. */
export const tseIdFromFileName = (file: string): string | null =>
  file
    .split(/[\\/]/)
    .pop()
    ?.match(/(\d{9,})/)?.[1] ?? null;
