import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadEnv } from '../config/load-env.js';
import { buildCliDataSourceOptions } from '../database/database.config.js';
import { applyPartyPositions, importCandidates } from './candidates.js';
import { resolveInput } from './files.js';
import { importPhotos, importPlans } from './media.js';
import { importHistory } from './history-import.js';
import { importSocialLinks } from './social-import.js';
import { summarizePlans } from './summaries.js';

const USAGE = `Uso: yarn api import:tse <comando> [caminho]

  candidatos <cand> <compl>  consulta_cand_2026 + consulta_cand_complementar_2026 (zip|dir|csv)
  fotos <zip|dir>            foto_cand2026_<UF>_div.zip (um por UF; rode para cada)
  planos <zip|dir>           planos de governo em PDF
  redes <zip|dir|csv>        rede_social_candidato_2026 (links normalizados, 1 por rede)
  historico <zip|dir|csv>    historico_candidatura_2026 (candidaturas anteriores e resultados)
  resumos [--force]          resume os planos de governo com a API do Claude (ANTHROPIC_API_KEY)
  partidos [--force]         reaplica as posições políticas padrão dos partidos

Caminhos relativos partem de packages/vc-api. Rode as migrations antes (yarn api migration:run).`;

loadEnv();
const [command, arg, ...rest] = process.argv.slice(2);
const needsPath = ['candidatos', 'fotos', 'planos', 'redes', 'historico'].includes(command ?? '');
if (!command || (needsPath && !arg)) {
  console.error(USAGE);
  process.exit(1);
}

const db = new DataSource(buildCliDataSourceOptions());
await db.initialize();
try {
  const input = needsPath ? resolveInput(arg) : '';
  if (command === 'candidatos') await importCandidates(db, [input, ...rest.map(resolveInput)]);
  else if (command === 'fotos') await importPhotos(db, input);
  else if (command === 'planos') await importPlans(db, input);
  else if (command === 'redes') await importSocialLinks(db, input);
  else if (command === 'historico') await importHistory(db, input);
  else if (command === 'resumos') await summarizePlans(db, arg === '--force');
  else if (command === 'partidos') await applyPartyPositions(db, arg === '--force');
  else {
    console.error(USAGE);
    process.exitCode = 1;
  }
} finally {
  await db.destroy();
}
