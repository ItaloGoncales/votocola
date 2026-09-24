import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { DataSource } from 'typeorm';
import { PHOTOS_DIR, PLANS_DIR } from '../app.setup.js';
import { listFiles, tseIdFromFileName } from './files.js';

/** Só copia arquivos de candidatos que já existem no banco (importe os candidatos antes). */
async function knownTseIds(db: DataSource): Promise<Set<string>> {
  const rows: { tse_id: string }[] = await db.query(`SELECT tse_id FROM candidates`);
  return new Set(rows.map((r) => String(r.tse_id)));
}

async function markInBatches(db: DataSource, sql: string, ids: string[], values?: string[]) {
  for (let i = 0; i < ids.length; i += 1000) {
    const params: unknown[] = [ids.slice(i, i + 1000)];
    if (values) params.push(values.slice(i, i + 1000));
    await db.query(sql, params);
  }
}

/** Fotos `foto_cand2026_<UF>_div.zip` -> `storage/fotos/<SQ_CANDIDATO>.jpg`. */
export async function importPhotos(db: DataSource, input: string): Promise<void> {
  const known = await knownTseIds(db);
  mkdirSync(PHOTOS_DIR, { recursive: true });
  const imported: string[] = [];
  for (const file of listFiles(input, ['.jpg', '.jpeg'])) {
    const tseId = tseIdFromFileName(file);
    if (!tseId || !known.has(tseId)) continue;
    copyFileSync(file, join(PHOTOS_DIR, `${tseId}.jpg`));
    imported.push(tseId);
  }
  await markInBatches(
    db,
    `UPDATE candidates SET has_photo = true WHERE tse_id = ANY($1::bigint[])`,
    imported,
  );
  console.log(`${imported.length} fotos importadas`);
}

/**
 * Planos de governo (PDF, só cargos majoritários) -> `storage/planos/<SQ_CANDIDATO>.pdf`.
 * Com mais de um PDF por candidato, fica o maior.
 */
export async function importPlans(db: DataSource, input: string): Promise<void> {
  const known = await knownTseIds(db);
  mkdirSync(PLANS_DIR, { recursive: true });
  const best = new Map<string, { file: string; size: number }>();
  for (const file of listFiles(input, ['.pdf'])) {
    const tseId = tseIdFromFileName(file);
    if (!tseId || !known.has(tseId)) continue;
    const size = statSync(file).size;
    if ((best.get(tseId)?.size ?? -1) < size) best.set(tseId, { file, size });
  }
  const ids: string[] = [];
  const names: string[] = [];
  for (const [tseId, { file }] of best) {
    copyFileSync(file, join(PLANS_DIR, `${tseId}.pdf`));
    ids.push(tseId);
    names.push(`${tseId}.pdf`);
  }
  await markInBatches(
    db,
    `UPDATE candidates c SET plan_file = v.name
     FROM unnest($1::bigint[], $2::text[]) AS v(tse_id, name) WHERE c.tse_id = v.tse_id`,
    ids,
    names,
  );
  console.log(`${ids.length} planos de governo importados`);
}
