import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { suppressAppOpen } from '@/ads';
import { Alert } from 'react-native';
import type { BallotSlot } from '@/api';
import { SHARE_URL } from '@/config';
import type { Picks } from '@/domain/colinha';
import { stateName } from '@/domain/states';

const escape = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function slotRow(slot: BallotSlot, index: number, picks: Picks): string {
  const pick = picks[slot.key];
  const digits = (pick?.number ?? '').padEnd(slot.digits, ' ').slice(0, slot.digits).split('');
  const boxes = digits
    .map((d) => `<span class="box">${d.trim() ? escape(d) : '&nbsp;'}</span>`)
    .join('');
  const who = pick
    ? `<span class="name">${escape(pick.ballotName)}</span> <span class="party">${escape(pick.partyAcronym)}</span>`
    : '<span class="blank"></span>';
  return `<tr>
    <td class="order">${index + 1}</td>
    <td class="office"><div class="label">${escape(slot.label)}</div>${who}</td>
    <td class="digits">${boxes}</td>
  </tr>`;
}

function copy(uf: string, ballot: BallotSlot[], picks: Picks): string {
  return `<section class="copy">
    <header>
      <div><div class="brand">VotoCola.</div><div class="title">Minha colinha · ${escape(stateName(uf))}</div></div>
      <div class="when">Eleições 2026 · 1º turno<br/>Domingo, 4 de outubro</div>
    </header>
    <table>${ballot.map((slot, i) => slotRow(slot, i, picks)).join('')}</table>
    <footer>Na urna, digite os números nesta ordem e aperte CONFIRMA. O celular não pode ser usado na cabine.
      Monte a sua em <b>${escape(SHARE_URL)}</b></footer>
  </section>`;
}

/**
 * HTML da colinha para impressão: A4, só preto no branco (sem fotos, economiza tinta), números em
 * quadradinhos grandes e cargos ainda sem escolha com espaço para escrever à mão. Duas cópias por
 * folha com linha de recorte.
 */
export function buildPrintHtml(uf: string, ballot: BallotSlot[], picks: Picks): string {
  const one = copy(uf, ballot, picks);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #000; background: #fff; }
  .copy { border: 1.5pt solid #000; border-radius: 4mm; padding: 5mm 6mm; height: 132mm; display: flex; flex-direction: column; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1pt solid #000; padding-bottom: 2.5mm; }
  .brand { font-size: 15pt; font-weight: 800; }
  .title { font-size: 11pt; margin-top: 0.5mm; }
  .when { font-size: 9pt; text-align: right; line-height: 1.3; }
  table { width: 100%; border-collapse: collapse; margin-top: 1mm; flex: 1; }
  tr { border-bottom: 0.5pt solid #999; }
  tr:last-child { border-bottom: none; }
  td { padding: 1.6mm 0; vertical-align: middle; }
  .order { width: 9mm; font-size: 13pt; font-weight: 800; text-align: center; }
  .office { padding-left: 2mm; }
  .label { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3pt; }
  .name { font-size: 12pt; font-weight: 700; }
  .party { font-size: 9pt; }
  .blank { display: inline-block; width: 60mm; border-bottom: 0.8pt solid #000; height: 5mm; }
  .digits { text-align: right; white-space: nowrap; }
  .box { display: inline-block; width: 9mm; height: 11mm; line-height: 11mm; margin-left: 1.2mm; border: 1.2pt solid #000;
         border-radius: 1mm; text-align: center; font-size: 19pt; font-weight: 800; font-family: 'Courier New', monospace; }
  footer { font-size: 8pt; border-top: 1pt solid #000; padding-top: 2mm; line-height: 1.35; }
  .cut { text-align: center; font-size: 8pt; color: #000; border-top: 1pt dashed #000; margin: 6mm 0; height: 0; }
  .cut span { position: relative; top: -2.2mm; background: #fff; padding: 0 3mm; }
</style></head><body>
${one}
<div class="cut"><span>✂ recorte aqui</span></div>
${one}
</body></html>`;
}

/** Base64 -> bytes (`atob` existe no Hermes). */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Gera o PDF (A4, pronto para imprimir) com nome claro e abre o compartilhamento do sistema:
 * WhatsApp, e-mail, Drive, "Salvar em Arquivos"... A pessoa manda direto para quem vai imprimir.
 */
export async function shareColinhaPdf(uf: string, ballot: BallotSlot[], picks: Picks) {
  try {
    // Pede o PDF em base64 e grava no cache do app já com o nome certo. Mover o arquivo gerado
    // falha no Expo Go: o expo-print grava numa pasta fora da área liberada para o projeto.
    const { base64 } = await Print.printToFileAsync({
      html: buildPrintHtml(uf, ballot, picks),
      base64: true,
    });
    if (!base64) throw new Error('PDF vazio');
    const named = new File(Paths.cache, `colinha-votocola-${uf}.pdf`);
    if (named.exists) named.delete();
    named.create();
    named.write(base64ToBytes(base64));
    suppressAppOpen();
    if (!(await Sharing.isAvailableAsync())) {
      await Print.printAsync({ uri: named.uri });
      return;
    }
    await Sharing.shareAsync(named.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Enviar colinha em PDF',
    });
  } catch {
    Alert.alert('Ops', 'Não foi possível gerar o PDF da colinha.');
  }
}
