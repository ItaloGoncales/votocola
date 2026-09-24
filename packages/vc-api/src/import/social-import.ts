import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { DataSource, EntityManager } from 'typeorm';
import { decode, parseCsv } from './csv.js';
import { listFiles } from './files.js';
import { pickSocialLinks } from './social.js';

type Db = Pick<DataSource | EntityManager, 'query'>;

/**
 * Peso de partida, usado só como desempate depois da popularidade real (visualizações/escolhas):
 * - maior mandato já conquistado (`candidate_history.mandate_weight`: presidente 30 ... vereador 6),
 *   com peso cheio se foi na última eleição do mesmo tipo (até 4 anos), 70% até 8 anos, 40% antes;
 * - +1 por eleição vencida (até 5) e +1 por rede social declarada (até 6).
 * Editorial e objetivo: favorece quem já teve mandato em relação a estreantes.
 */
export async function refreshPriorScores(db: Db): Promise<void> {
  await db.query(`
    UPDATE candidates SET prior_score = s.score FROM (
      SELECT c.id,
        (COALESCE(round(max(h.mandate_weight * CASE
           WHEN c.election_year - h.election_year <= 4 THEN 1.0
           WHEN c.election_year - h.election_year <= 8 THEN 0.7
           ELSE 0.4 END)), 0)
         + LEAST(count(h.id) FILTER (WHERE h.elected), 5)
         + LEAST(jsonb_array_length(c.social_links), 6))::smallint AS score
      FROM candidates c
      LEFT JOIN candidate_history h ON h.candidate_id = c.id
      GROUP BY c.id
    ) s
    WHERE candidates.id = s.id AND candidates.prior_score <> s.score`);
}

/**
 * Importa `rede_social_candidato_2026` (zip, diretório ou CSV): normaliza os links e grava até um
 * por rede em `candidates.social_links`. Candidatos que não aparecem no arquivo ficam sem redes.
 */
export async function importSocialLinks(db: DataSource, input: string): Promise<void> {
  const files = listFiles(input, ['.csv', '.txt']).filter((f) =>
    /rede_social_candidato_\d{4}_/i.test(f),
  );
  const national = files.filter((f) => /_BRASIL\./i.test(f));
  const selected = national.length ? national : files;
  if (!selected.length) throw new Error(`Nenhum rede_social_candidato_*.csv em ${input}`);

  const raw = new Map<string, { order: number; url: string }[]>();
  for (const file of selected) {
    for (const r of parseCsv(decode(readFileSync(file)))) {
      if (!r.SQ_CANDIDATO || !r.DS_URL) continue;
      const list = raw.get(r.SQ_CANDIDATO) ?? [];
      list.push({ order: Number(r.NR_ORDEM_REDE_SOCIAL) || 0, url: r.DS_URL });
      raw.set(r.SQ_CANDIDATO, list);
    }
  }

  const ids: string[] = [];
  const links: string[] = [];
  let total = 0;
  for (const [tseId, list] of raw) {
    const picked = pickSocialLinks(list.sort((a, b) => a.order - b.order).map((l) => l.url));
    ids.push(tseId);
    links.push(JSON.stringify(picked));
    total += picked.length;
  }

  await db.transaction(async (tx) => {
    await tx.query(`UPDATE candidates SET social_links = '[]' WHERE social_links <> '[]'`);
    for (let i = 0; i < ids.length; i += 2000) {
      await tx.query(
        `UPDATE candidates c SET social_links = v.links::jsonb, updated_at = now()
         FROM unnest($1::bigint[], $2::text[]) AS v(tse_id, links)
         WHERE c.tse_id = v.tse_id`,
        [ids.slice(i, i + 2000), links.slice(i, i + 2000)],
      );
    }
    await refreshPriorScores(tx);
  });
  console.log(
    `${selected.map((f) => basename(f)).join(', ')}: ${total} links válidos para ${ids.length} candidatos`,
  );
}
