import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { DataSource } from 'typeorm';
import { PLANS_DIR } from '../app.setup.js';

const MODEL = 'claude-opus-5';
/** Limite de 32 MB por requisição (o base64 cresce ~33%). */
const MAX_PDF_BYTES = 22 * 1024 * 1024;
const CONCURRENCY = 3;

// Fixo e igual em todas as chamadas: é o prefixo que o prompt caching reaproveita.
const SYSTEM = `Você resume planos de governo de candidatos às eleições brasileiras de 2026 para um app de consulta de eleitores.

Regras:
- Português do Brasil, linguagem simples, tom estritamente neutro e informativo.
- Entre 100 e 150 palavras, em texto corrido (sem títulos, listas ou markdown).
- Cite as 4 a 6 propostas mais concretas e centrais do documento, sem avaliar, elogiar ou criticar.
- Use apenas o que está no documento; não invente números nem promessas.
- Não mencione o nome do candidato nem o partido (o app já mostra).
- Se o documento não trouxer propostas legíveis, responda exatamente: SEM_PROPOSTAS`;

async function summarize(client: Anthropic, pdf: Buffer): Promise<string | null> {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium' },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdf.toString('base64') },
          },
          { type: 'text', text: 'Resuma este plano de governo seguindo as regras.' },
        ],
      },
    ],
  });
  if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') return null;
  const text = response.content
    .flatMap((block) => (block.type === 'text' ? [block.text] : []))
    .join('')
    .trim();
  return !text || text === 'SEM_PROPOSTAS' ? null : text;
}

/**
 * Gera o resumo dos planos de governo importados (`planos`) com a API do Claude. Só processa
 * quem ainda não tem resumo, salvo com `force`. Exige ANTHROPIC_API_KEY (ou `ant auth login`).
 * Os resumos são gerados por IA: revise antes de publicar.
 */
export async function summarizePlans(db: DataSource, force: boolean): Promise<void> {
  const rows: { id: string; ballot_name: string; plan_file: string }[] = await db.query(
    `SELECT id, ballot_name, plan_file FROM candidates
     WHERE plan_file IS NOT NULL ${force ? '' : 'AND plan_summary IS NULL'} ORDER BY office, state`,
  );
  const client = new Anthropic();
  let done = 0;
  let failed = 0;

  const queue = [...rows];
  const worker = async () => {
    for (let row = queue.shift(); row; row = queue.shift()) {
      const file = join(PLANS_DIR, row.plan_file);
      try {
        if (statSync(file).size > MAX_PDF_BYTES) throw new Error('PDF grande demais');
        const summary = await summarize(client, readFileSync(file));
        if (!summary) throw new Error('sem resumo (recusa ou documento ilegível)');
        await db.query(
          `UPDATE candidates SET plan_summary = $2, updated_at = now() WHERE id = $1`,
          [row.id, summary],
        );
        done++;
        console.log(`[${done + failed}/${rows.length}] ${row.ballot_name}`);
      } catch (error) {
        failed++;
        const reason =
          error instanceof Anthropic.APIError
            ? `API ${error.status}: ${error.message}`
            : String(error);
        console.warn(`[${done + failed}/${rows.length}] ${row.ballot_name}: ${reason}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`${done} resumos gerados, ${failed} falhas`);
}
