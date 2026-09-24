import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { DataSource } from 'typeorm';
import { clean, decode, parseCsv, titleCase } from './csv.js';
import { listFiles } from './files.js';
import { refreshPriorScores } from './social-import.js';

/** Peso do mandato por `CD_CARGO` (visibilidade do cargo). */
const MANDATE_WEIGHT: Record<number, number> = {
  1: 30, // Presidente
  3: 25, // Governador
  5: 25, // Senador
  6: 18, // Deputado Federal
  11: 15, // Prefeito
  7: 14, // Deputado Estadual
  8: 14, // Deputado Distrital
  2: 10, // Vice-presidente
  4: 10, // Vice-governador
  12: 6, // Vice-prefeito
  13: 6, // Vereador
  9: 3, // 1º suplente de senador
  10: 3, // 2º suplente de senador
};

/** Resultado do TSE em linguagem simples (e neutra quanto a gênero). */
export function resultLabel(raw: string | null): { result: string | null; elected: boolean } {
  if (!raw) return { result: null, elected: false };
  if (/^eleito/i.test(raw)) return { result: 'Eleito(a)', elected: true };
  if (/^n[ãa]o eleito/i.test(raw)) return { result: 'Não eleito(a)', elected: false };
  if (/^suplente/i.test(raw)) return { result: 'Suplente', elected: false };
  return { result: raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase(), elected: false };
}

interface Row {
  tseId: string;
  year: number;
  round: number;
  officeCode: number;
  office: string;
  state: string | null;
  place: string | null;
  party: string | null;
  result: string | null;
  elected: boolean;
}

/**
 * Importa `historico_candidatura_2026` (zip, diretório ou CSV): candidaturas anteriores de cada
 * candidato atual, só o turno final de cada eleição. Substitui o histórico inteiro, mantém os
 * atributos `elected-before` / `first-run` e recalcula o peso de partida.
 */
export async function importHistory(db: DataSource, input: string): Promise<void> {
  const files = listFiles(input, ['.csv', '.txt']).filter((f) =>
    /historico_candidatura_\d{4}_/i.test(f),
  );
  const national = files.filter((f) => /_BRASIL\./i.test(f));
  const selected = national.length ? national : files;
  if (!selected.length) throw new Error(`Nenhum historico_candidatura_*.csv em ${input}`);

  // Turno final de cada (pessoa, eleição, cargo): o 1º turno de quem foi ao 2º diz só "2º turno".
  const finals = new Map<string, Row>();
  for (const file of selected) {
    for (const r of parseCsv(decode(readFileSync(file)))) {
      const tseId = clean(r.SQ_CANDIDATO_ATUAL);
      const year = Number(r.ANO_ELEICAO);
      if (!tseId || !year || year >= Number(r.ANO_ELEICAO_ATUAL)) continue;
      const officeCode = Number(r.CD_CARGO);
      const key = `${tseId}:${year}:${officeCode}:${r.SQ_CANDIDATO}`;
      const round = Number(r.NR_TURNO) || 1;
      if ((finals.get(key)?.round ?? 0) >= round) continue;
      const { result, elected } = resultLabel(clean(r.DS_SIT_TOT_TURNO));
      const uf = clean(r.SG_UF);
      finals.set(key, {
        tseId,
        year,
        round,
        officeCode,
        // O TSE alterna "Vice-governador"/"Vice-Governador" entre anos: padroniza.
        office: titleCase(clean(r.DS_CARGO) ?? 'Cargo não informado'),
        state: uf && uf.length === 2 ? uf.toUpperCase() : null,
        place: titleCase(clean(r.NM_UE) ?? '') || null,
        party: clean(r.SG_PARTIDO),
        result,
        elected,
      });
    }
  }
  const rows = [...finals.values()];

  await db.transaction(async (tx) => {
    await tx.query(`DELETE FROM candidate_history`);
    for (let i = 0; i < rows.length; i += 2000) {
      const batch = rows.slice(i, i + 2000);
      await tx.query(
        `INSERT INTO candidate_history
           (candidate_id, election_year, office, state, place, party, result, elected, mandate_weight)
         SELECT c.id, v.year, v.office, v.state, v.place, v.party, v.result, v.elected, v.weight
         FROM unnest($1::bigint[], $2::smallint[], $3::text[], $4::text[], $5::text[], $6::text[],
                     $7::text[], $8::boolean[], $9::smallint[])
           AS v(tse_id, year, office, state, place, party, result, elected, weight)
         JOIN candidates c ON c.tse_id = v.tse_id`,
        [
          batch.map((r) => r.tseId),
          batch.map((r) => r.year),
          batch.map((r) => r.office),
          batch.map((r) => r.state),
          batch.map((r) => r.place),
          batch.map((r) => r.party),
          batch.map((r) => r.result),
          batch.map((r) => r.elected),
          batch.map((r) => (r.elected ? (MANDATE_WEIGHT[r.officeCode] ?? 0) : 0)),
        ],
      );
    }

    // Atributos de carreira, recalculados a partir do histórico.
    await tx.query(`
      DELETE FROM candidate_attributes
      WHERE attribute_id IN (SELECT id FROM attributes WHERE slug IN ('elected-before', 'first-run'))`);
    await tx.query(`
      INSERT INTO candidate_attributes (candidate_id, attribute_id)
      SELECT DISTINCT h.candidate_id, a.id FROM candidate_history h
      JOIN attributes a ON a.slug = 'elected-before' WHERE h.elected`);
    await tx.query(`
      INSERT INTO candidate_attributes (candidate_id, attribute_id)
      SELECT c.id, a.id FROM candidates c JOIN attributes a ON a.slug = 'first-run'
      WHERE NOT EXISTS (SELECT 1 FROM candidate_history h WHERE h.candidate_id = c.id)`);
    await refreshPriorScores(tx);
  });
  console.log(
    `${selected.map((f) => basename(f)).join(', ')}: ${rows.length} candidaturas anteriores`,
  );
}
