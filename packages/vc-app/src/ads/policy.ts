/** Intervalo mínimo entre anúncios de abertura. */
export const APP_OPEN_COOLDOWN_MS = 30 * 60_000;
/** Sem abertura logo depois de um intersticial (anúncio atrás de anúncio). */
export const AFTER_INTERSTITIAL_MS = 60_000;
/** O Google descarta anúncios de abertura carregados há mais de 4 h. */
export const APP_OPEN_EXPIRY_MS = 4 * 60 * 60_000;
/** Na abertura "a frio", só mostra se o anúncio carregar logo (sem pegar a pessoa no meio do uso). */
export const COLD_START_WINDOW_MS = 8_000;

export interface AppOpenState {
  now: number;
  /** Já passou pelas boas-vindas: nunca mostrar na primeira abertura. */
  onboarded: boolean;
  loadedAt: number | null;
  lastShownAt: number;
  lastInterstitialAt: number;
  /** Voltando de algo que o próprio app abriu (compartilhar, PDF, link): não mostrar. */
  returningFromOwnAction: boolean;
}

export const isExpired = (loadedAt: number | null, now: number) =>
  loadedAt === null || now - loadedAt > APP_OPEN_EXPIRY_MS;

/** Regras do anúncio de abertura, em um lugar só (e testáveis sem o SDK nativo). */
export function shouldShowAppOpen(s: AppOpenState): boolean {
  if (!s.onboarded || s.returningFromOwnAction) return false;
  if (isExpired(s.loadedAt, s.now)) return false;
  if (s.now - s.lastShownAt < APP_OPEN_COOLDOWN_MS) return false;
  if (s.now - s.lastInterstitialAt < AFTER_INTERSTITIAL_MS) return false;
  return true;
}
