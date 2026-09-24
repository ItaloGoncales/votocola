import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { DataSource, EntityManager } from 'typeorm';
import { OFFICE_BY_TSE_CODE, type Office } from '../domain/offices.js';
import { normalizeText } from '../domain/text.js';
import { clean, decode, parseCsv, parseDate, titleCase } from './csv.js';
import { listFiles } from './files.js';
import { CANDIDATE_POSITIONS, positionForParty } from './party-positions.js';
import { refreshPriorScores } from './social-import.js';

/** Algo que executa SQL: o DataSource ou o EntityManager de uma transação. */
type Db = Pick<DataSource | EntityManager, 'query'>;
type Row = Record<string, string>;

/**
 * Situações (`DS_SITUACAO_JULGAMENTO`, do arquivo complementar) em que o voto não vale mesmo que o
 * nome ainda esteja na urna. "Indeferido com recurso" e "pendente" continuam valendo por ora.
 */
const VOID_STATUSES = new Set([
  'RENÚNCIA',
  'INDEFERIDO',
  'CANCELADO',
  'PEDIDO NÃO CONHECIDO',
  'FALECIDO',
  'CASSADO',
]);

/** Atributos derivados do CSV; os vínculos deles são recalculados a cada importação. */
const AUTO_ATTRIBUTES: Record<string, (r: CandidateRow) => boolean> = {
  woman: (r) => r.gender === 'FEMININO',
  man: (r) => r.gender === 'MASCULINO',
  reelection: (r) => r.reelection,
  'race-black': (r) => r.raceColor === 'PRETA',
  'race-brown': (r) => r.raceColor === 'PARDA',
  'race-white': (r) => r.raceColor === 'BRANCA',
  'race-yellow': (r) => r.raceColor === 'AMARELA',
  'race-indigenous': (r) => r.raceColor === 'INDÍGENA' || r.raceColor === 'INDIGENA',
  quilombola: (r) => r.quilombola,
};

interface PartyRow {
  number: number;
  acronym: string;
  name: string;
  federationAcronym: string | null;
  federationName: string | null;
}

interface CandidateRow {
  tseId: string;
  electionYear: number;
  state: string;
  office: Office;
  number: string;
  ballotName: string;
  fullName: string;
  partyNumber: number;
  coalitionName: string | null;
  coalitionParties: string | null;
  gender: string | null;
  raceColor: string | null;
  birthDate: string | null;
  education: string | null;
  occupation: string | null;
  reelection: boolean;
  quilombola: boolean;
  status: string | null;
  statusDetail: string | null;
  active: boolean;
  searchText: string;
}

const upper = (v: string | null) => (v ? v.toUpperCase() : null);
/** `45-PSDB/23-CIDADANIA` -> `PSDB / CIDADANIA` (o TSE põe a composição em `SG_FEDERACAO`). */
export const partiesOf = (v: string | null) =>
  v
    ? v
        .split('/')
        .map((p) => p.replace(/^\s*\d+\s*-\s*/, '').trim())
        .join(' / ')
    : null;
const sentence = (v: string | null) => (v ? v.charAt(0) + v.slice(1).toLowerCase() : null);

/**
 * Desde 2026 o TSE separa a candidatura em dois arquivos ligados por `SQ_CANDIDATO`: o principal
 * (`consulta_cand`) e o complementar (`consulta_cand_complementar`: situação do julgamento,
 * presença na urna, reeleição, quilombola...).
 */
function toRows(
  records: Row[],
  complementary: Map<string, Row>,
): { parties: PartyRow[]; rows: CandidateRow[] } {
  const parties = new Map<number, PartyRow>();
  const rows = new Map<string, CandidateRow>();

  for (const r of records) {
    const office = OFFICE_BY_TSE_CODE[Number(r.CD_CARGO)];
    const tseId = clean(r.SQ_CANDIDATO);
    const partyNumber = Number(clean(r.NR_PARTIDO));
    // Só o 1º turno e só os cargos que vão para a colinha (sem vices e suplentes).
    if (!office || !tseId || !partyNumber) continue;
    if (r.NR_TURNO && r.NR_TURNO !== '1') continue;

    const acronym = clean(r.SG_PARTIDO) ?? String(partyNumber);
    parties.set(partyNumber, {
      number: partyNumber,
      acronym,
      name: titleCase(clean(r.NM_PARTIDO) ?? acronym),
      federationAcronym: partiesOf(clean(r.SG_FEDERACAO)),
      federationName: titleCase(clean(r.NM_FEDERACAO) ?? '') || null,
    });

    const extra: Row = complementary.get(tseId) ?? {};
    const ballotName = titleCase(clean(r.NM_URNA_CANDIDATO) ?? clean(r.NM_CANDIDATO) ?? '');
    // Nome social tem precedência; o nome civil nem entra na busca quando há nome social.
    const fullName = titleCase(clean(r.NM_SOCIAL_CANDIDATO) ?? clean(r.NM_CANDIDATO) ?? ballotName);
    const number = clean(r.NR_CANDIDATO) ?? '';
    const status = upper(clean(extra.DS_SITUACAO_JULGAMENTO) ?? clean(r.DS_SITUACAO_CANDIDATURA));
    // Sem o complementar, cai no layout antigo (situação da candidatura no arquivo principal).
    const onBallot = extra.ST_CANDIDATO_INSERIDO_URNA
      ? clean(extra.ST_CANDIDATO_INSERIDO_URNA) === 'SIM'
      : status !== 'INAPTO';
    const isCoalition = clean(r.TP_AGREMIACAO) === 'COLIGAÇÃO';
    const row: CandidateRow = {
      tseId,
      electionYear: Number(clean(r.ANO_ELEICAO) ?? 2026),
      state: (clean(r.SG_UF) ?? '').toUpperCase(),
      office,
      number,
      ballotName,
      fullName,
      partyNumber,
      coalitionName: isCoalition ? titleCase(clean(r.NM_COLIGACAO) ?? '') || null : null,
      coalitionParties: isCoalition ? clean(r.DS_COMPOSICAO_COLIGACAO) : null,
      gender: upper(clean(r.DS_GENERO)),
      raceColor: upper(clean(r.DS_COR_RACA)),
      birthDate: parseDate(clean(r.DT_NASCIMENTO)),
      education: sentence(clean(r.DS_GRAU_INSTRUCAO)),
      occupation: sentence(clean(r.DS_OCUPACAO)),
      reelection: clean(extra.ST_REELEICAO ?? r.ST_REELEICAO) === 'S',
      quilombola: clean(extra.ST_QUILOMBOLA) === 'S',
      status,
      statusDetail: upper(clean(extra.DS_DETALHE_SITUACAO_CAND ?? r.DS_DETALHE_SITUACAO_CAND)),
      active: onBallot && !VOID_STATUSES.has(status ?? ''),
      searchText: normalizeText(`${ballotName} ${fullName} ${number} ${acronym}`),
    };
    if (row.state.length === 2 && row.number) rows.set(tseId, row);
  }
  return { parties: [...parties.values()], rows: [...rows.values()] };
}

async function upsertParties(db: Db, parties: PartyRow[]): Promise<void> {
  for (const p of parties) {
    await db.query(
      `INSERT INTO parties (number, acronym, name, position, federation_acronym, federation_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (number) DO UPDATE SET
         acronym = EXCLUDED.acronym, name = EXCLUDED.name,
         position = COALESCE(parties.position, EXCLUDED.position),
         federation_acronym = EXCLUDED.federation_acronym, federation_name = EXCLUDED.federation_name,
         updated_at = now()`,
      [
        p.number,
        p.acronym,
        p.name,
        positionForParty(p.acronym),
        p.federationAcronym,
        p.federationName,
      ],
    );
  }
}

const COLUMNS = [
  'tse_id',
  'election_year',
  'state',
  'office',
  'number',
  'ballot_name',
  'full_name',
  'party_number',
  'coalition_name',
  'coalition_parties',
  'gender',
  'race_color',
  'birth_date',
  'education',
  'occupation',
  'reelection',
  'status',
  'status_detail',
  'active',
  'search_text',
] as const;

const values = (r: CandidateRow) => [
  r.tseId,
  r.electionYear,
  r.state,
  r.office,
  r.number,
  r.ballotName,
  r.fullName,
  r.partyNumber,
  r.coalitionName,
  r.coalitionParties,
  r.gender,
  r.raceColor,
  r.birthDate,
  r.education,
  r.occupation,
  r.reelection,
  r.status,
  r.statusDetail,
  r.active,
  r.searchText,
];

/** Upsert por `tse_id`. Não toca em posição, foto, plano nem resumo (mantidos entre importações). */
async function upsertBatch(db: Db, batch: CandidateRow[], attributeIds: Map<string, number>) {
  const params: unknown[] = [];
  const tuples = batch.map((r) => {
    const start = params.length;
    params.push(...values(r));
    return `(${COLUMNS.map((_, i) => `$${start + i + 1}`).join(', ')})`;
  });
  const updates = COLUMNS.filter((c) => c !== 'tse_id')
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(', ');
  const inserted: { id: string; tse_id: string }[] = await db.query(
    `INSERT INTO candidates (${COLUMNS.join(', ')}) VALUES ${tuples.join(', ')}
     ON CONFLICT (tse_id) DO UPDATE SET ${updates}, updated_at = now()
     RETURNING id, tse_id`,
    params,
  );

  const idByTse = new Map(inserted.map((row) => [String(row.tse_id), row.id]));
  const ids = [...idByTse.values()];
  await db.query(
    `DELETE FROM candidate_attributes WHERE candidate_id = ANY($1::uuid[]) AND attribute_id = ANY($2::smallint[])`,
    [ids, [...attributeIds.values()]],
  );
  const links: [string, number][] = [];
  for (const r of batch) {
    const id = idByTse.get(r.tseId);
    if (!id) continue;
    for (const [slug, test] of Object.entries(AUTO_ATTRIBUTES)) {
      const attributeId = attributeIds.get(slug);
      if (attributeId !== undefined && test(r)) links.push([id, attributeId]);
    }
  }
  if (links.length) {
    await db.query(
      `INSERT INTO candidate_attributes (candidate_id, attribute_id)
       SELECT * FROM unnest($1::uuid[], $2::smallint[]) ON CONFLICT DO NOTHING`,
      [links.map(([id]) => id), links.map(([, attr]) => attr)],
    );
  }
}

/** Se existir o arquivo `_BRASIL` (todas as UFs), usa só ele; senão, os arquivos por UF. */
function pick(files: string[], pattern: RegExp): string[] {
  const matching = files.filter((f) => pattern.test(f));
  const national = matching.filter((f) => /_BRASIL\./i.test(f));
  return national.length ? national : matching;
}

/**
 * Importa `consulta_cand_2026` + `consulta_cand_complementar_2026` (zips, diretórios ou
 * arquivos; passe os dois). Sem o complementar, reeleição e situação do julgamento ficam vazias.
 */
export async function importCandidates(db: DataSource, inputs: string[]): Promise<void> {
  const files = inputs.flatMap((input) => listFiles(input, ['.csv', '.txt']));
  const selected = pick(files, /consulta_cand_\d{4}_/i);
  const extraFiles = pick(files, /consulta_cand_complementar_\d{4}_/i);
  if (!selected.length) throw new Error(`Nenhum consulta_cand_*.csv em ${inputs.join(', ')}`);
  if (!extraFiles.length)
    console.warn('Aviso: sem consulta_cand_complementar; situação e reeleição ficam incompletas.');

  const complementary = new Map<string, Row>();
  for (const file of extraFiles) {
    for (const row of parseCsv(decode(readFileSync(file)))) {
      if (row.SQ_CANDIDATO) complementary.set(row.SQ_CANDIDATO, row);
    }
  }

  const attributeIds = new Map<string, number>(
    (
      await db.query(`SELECT id, slug FROM attributes WHERE slug = ANY($1)`, [
        Object.keys(AUTO_ATTRIBUTES),
      ])
    ).map((a: { id: number; slug: string }) => [a.slug, a.id]),
  );

  for (const file of selected) {
    const { parties, rows } = toRows(parseCsv(decode(readFileSync(file))), complementary);
    await db.transaction(async (tx) => {
      await upsertParties(tx, parties);
      for (let i = 0; i < rows.length; i += 500) {
        await upsertBatch(tx, rows.slice(i, i + 500), attributeIds);
      }
      await applyCandidatePositions(tx, false);
      await refreshPriorScores(tx);
    });
    const active = rows.filter((r) => r.active).length;
    console.log(
      `${basename(file)}: ${rows.length} candidatos (${active} na disputa), ${parties.length} partidos`,
    );
  }
}

/** Aplica as exceções de `CANDIDATE_POSITIONS` a quem ainda não tem posição própria. */
async function applyCandidatePositions(db: Db, force: boolean): Promise<void> {
  const entries = Object.entries(CANDIDATE_POSITIONS);
  if (!entries.length) return;
  await db.query(
    `UPDATE candidates c SET position = v.position, updated_at = now()
     FROM unnest($1::bigint[], $2::text[]) AS v(tse_id, position)
     WHERE c.tse_id = v.tse_id ${force ? '' : 'AND c.position IS NULL'}`,
    [entries.map(([id]) => id), entries.map(([, p]) => p)],
  );
}

/** Reaplica as posições padrão (`party-positions.ts`), sobrescrevendo as do banco se `force`. */
export async function applyPartyPositions(db: DataSource, force: boolean): Promise<void> {
  await applyCandidatePositions(db, force);
  const parties: { number: number; acronym: string }[] = await db.query(
    `SELECT number, acronym FROM parties ${force ? '' : 'WHERE position IS NULL'}`,
  );
  for (const p of parties) {
    await db.query(`UPDATE parties SET position = $2, updated_at = now() WHERE number = $1`, [
      p.number,
      positionForParty(p.acronym),
    ]);
  }
  const missing = await db.query(`SELECT acronym FROM parties WHERE position IS NULL ORDER BY 1`);
  console.log(
    `${parties.length} partidos atualizados. Sem posição: ${missing.map((m: { acronym: string }) => m.acronym).join(', ') || 'nenhum'}`,
  );
}
