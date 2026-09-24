/** Redes reconhecidas nos links do TSE (`rede_social_candidato`). `site` = qualquer outro domínio. */
export type SocialNetwork =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'threads'
  | 'whatsapp'
  | 'telegram'
  | 'linkedin'
  | 'kwai'
  | 'site';

export interface SocialLink {
  network: SocialNetwork;
  url: string;
}

/** Ordem de exibição (e prioridade quando há mais links que o limite). */
export const NETWORK_ORDER: SocialNetwork[] = [
  'instagram',
  'tiktok',
  'youtube',
  'facebook',
  'x',
  'threads',
  'linkedin',
  'telegram',
  'site',
];

/** Reconhecidas mas não exibidas: grupos/contatos de WhatsApp e Kwai (decisão de produto). */
const OMITTED: SocialNetwork[] = ['whatsapp', 'kwai'];

const MAX_LINKS = 8;

const HOSTS: [RegExp, SocialNetwork][] = [
  [/(^|\.)instagram\.com$|(^|\.)instagr\.am$/, 'instagram'],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$|(^|\.)fb\.watch$/, 'facebook'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'youtube'],
  [/(^|\.)x\.com$|(^|\.)twitter\.com$/, 'x'],
  [/(^|\.)threads\.(net|com)$/, 'threads'],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/, 'whatsapp'],
  [/(^|\.)t\.me$|(^|\.)telegram\.me$/, 'telegram'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)kwai(-video)?\.com$/, 'kwai'],
];

/** Parâmetros de rastreio/compartilhamento: não mudam o destino e expõem quem compartilhou. */
const TRACKING =
  /^(utm_.*|igsh|igshid|rdid|share_url|si|mibextid|fbclid|gclid|_rdr|ref|ref_src|is_from_webapp|sender_device|_t|_r)$/i;

/**
 * Normaliza um link declarado ao TSE: completa `https://`, descarta o que não é URL (ex.: só
 * `@usuario`, sem dizer a rede), tira parâmetros de rastreio e identifica a rede pelo domínio.
 */
export function normalizeSocialUrl(raw: string): SocialLink | null {
  const text = raw.trim().replace(/\s+/g, '');
  if (!text || text.startsWith('@')) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.')) return null;
  url.protocol = 'https:';
  url.hostname = url.hostname.replace(/^(www|m|mobile|web)\./, '');
  // Copia as chaves antes: apagar durante a iteração pularia parâmetros.
  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING.test(key)) url.searchParams.delete(key);
  }
  url.hash = '';
  const network = HOSTS.find(([pattern]) => pattern.test(url.hostname))?.[1] ?? 'site';
  const href = url.toString().replace(/\/(\?|$)/, '$1');
  return { network, url: href };
}

/** Um link por rede (o primeiro declarado), na ordem de exibição, até `MAX_LINKS`. */
export function pickSocialLinks(raws: string[]): SocialLink[] {
  const byNetwork = new Map<SocialNetwork, SocialLink>();
  for (const raw of raws) {
    const link = normalizeSocialUrl(raw);
    if (link && !OMITTED.includes(link.network) && !byNetwork.has(link.network)) {
      byNetwork.set(link.network, link);
    }
  }
  return NETWORK_ORDER.flatMap((n) => byNetwork.get(n) ?? []).slice(0, MAX_LINKS);
}
