import { Platform } from 'react-native';

/** URL da API GraphQL. No celular, `localhost` é o próprio aparelho: use o IP da máquina em `.env`. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/graphql';

/** Base pública da API (sem `/graphql`): também serve os termos e a política de privacidade. */
const API_BASE = API_URL.replace(/\/graphql\/?$/, '');

/** Documentos legais (as lojas exigem as mesmas URLs no cadastro do app). */
export const LEGAL_URLS = {
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? `${API_BASE}/termos`,
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? `${API_BASE}/privacidade`,
};

/** Links das lojas: vão na imagem compartilhada da colinha. */
export const STORE_URLS = {
  android:
    process.env.EXPO_PUBLIC_PLAY_STORE_URL ??
    'https://play.google.com/store/apps/details?id=app.votocola.mobile',
  ios: process.env.EXPO_PUBLIC_APP_STORE_URL ?? 'https://apps.apple.com/br/app/votocola',
};

/** Link curto exibido na imagem (idealmente uma página que redireciona para a loja certa). */
export const SHARE_URL = process.env.EXPO_PUBLIC_SHARE_URL ?? 'votocola.app';

export const STORE_URL = Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;

/**
 * IDs dos blocos do AdMob. Sem as variáveis, usa os IDs de teste do Google (obrigatório em dev:
 * clicar em anúncio real do próprio app pode suspender a conta).
 */
export const AD_UNITS = {
  banner: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
  }),
  interstitial: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID,
  }),
};
