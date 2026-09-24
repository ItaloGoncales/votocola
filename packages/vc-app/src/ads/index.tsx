import Constants, { ExecutionEnvironment } from 'expo-constants';
import { AppState, Platform, View, type AppStateStatus } from 'react-native';
import { AD_UNITS } from '@/config';
import { store } from '@/store';
import { COLD_START_WINDOW_MS, isExpired, shouldShowAppOpen } from './policy';

type AdsModule = typeof import('react-native-google-mobile-ads');

/**
 * O AdMob é nativo: não existe no Expo Go nem na web. Lá os anúncios viram no-op; num
 * development build (`expo run:android|ios` ou EAS) eles funcionam normalmente. Sem as variáveis
 * EXPO_PUBLIC_ADMOB_* (builds de desenvolvimento), usa os IDs de teste do Google.
 */
const ads: AdsModule | null = (() => {
  if (Platform.OS === 'web') return null;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as AdsModule;
  } catch {
    return null;
  }
})();

/** Evita anúncio atrás de anúncio quando a pessoa monta a colinha inteira de uma vez. */
const INTERSTITIAL_COOLDOWN_MS = 90_000;
let lastInterstitialAt = 0;
let interstitial: ReturnType<AdsModule['InterstitialAd']['createForAdRequest']> | null = null;
let interstitialLoaded = false;

function loadInterstitial() {
  if (!ads) return;
  interstitial = ads.InterstitialAd.createForAdRequest(
    AD_UNITS.interstitial ?? ads.TestIds.INTERSTITIAL,
  );
  interstitialLoaded = false;
  interstitial.addAdEventListener(ads.AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  interstitial.addAdEventListener(ads.AdEventType.CLOSED, loadInterstitial);
  interstitial.addAdEventListener(ads.AdEventType.ERROR, () => {
    interstitialLoaded = false;
  });
  interstitial.load();
}

// ---- Anúncio de abertura (ao abrir o app e ao voltar para ele) ----
const launchedAt = Date.now();
let appOpen: ReturnType<AdsModule['AppOpenAd']['createForAdRequest']> | null = null;
let appOpenLoadedAt: number | null = null;
let appOpenShowing = false;
let lastAppOpenAt = 0;
let coldStartPending = true;
let returningFromOwnAction = false;
let appState: AppStateStatus = AppState.currentState;

function loadAppOpen() {
  if (!ads) return;
  appOpen = ads.AppOpenAd.createForAdRequest(AD_UNITS.appOpen ?? ads.TestIds.APP_OPEN);
  appOpenLoadedAt = null;
  appOpen.addAdEventListener(ads.AdEventType.LOADED, () => {
    appOpenLoadedAt = Date.now();
    // Abertura "a frio": só se carregar rápido, com o app ainda na frente.
    if (
      coldStartPending &&
      Date.now() - launchedAt < COLD_START_WINDOW_MS &&
      appState === 'active'
    ) {
      maybeShowAppOpen();
    }
    coldStartPending = false;
  });
  appOpen.addAdEventListener(ads.AdEventType.CLOSED, () => {
    appOpenShowing = false;
    loadAppOpen();
  });
  appOpen.addAdEventListener(ads.AdEventType.ERROR, () => {
    appOpenShowing = false;
    appOpenLoadedAt = null;
  });
  appOpen.load();
}

function maybeShowAppOpen() {
  if (!appOpen || appOpenShowing) return;
  const now = Date.now();
  if (isExpired(appOpenLoadedAt, now)) {
    loadAppOpen();
    return;
  }
  const show = shouldShowAppOpen({
    now,
    onboarded: store.get().onboarded,
    loadedAt: appOpenLoadedAt,
    lastShownAt: lastAppOpenAt,
    lastInterstitialAt,
    returningFromOwnAction: false,
  });
  if (!show) return;
  appOpenShowing = true;
  lastAppOpenAt = now;
  appOpen.show().catch(() => {
    appOpenShowing = false;
  });
}

function onAppStateChange(next: AppStateStatus) {
  const cameBack = appState.match(/inactive|background/) && next === 'active';
  appState = next;
  if (!cameBack) return;
  // Voltando do compartilhamento, do PDF ou de um link aberto pelo próprio app: não interromper.
  if (returningFromOwnAction) {
    returningFromOwnAction = false;
    return;
  }
  maybeShowAppOpen();
}

/**
 * Chamar antes de abrir algo fora do app (compartilhar, PDF, navegador, redes sociais): a volta
 * para o app não dispara anúncio de abertura.
 */
export function suppressAppOpen() {
  returningFromOwnAction = true;
}

let started = false;

/** iPhone: pede a permissão de rastreamento (ATT) antes de carregar anúncios, como a Apple exige. */
async function startAds() {
  if (!ads || started) return;
  started = true;
  if (Platform.OS === 'ios') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const att =
        require('expo-tracking-transparency') as typeof import('expo-tracking-transparency');
      await att.requestTrackingPermissionsAsync(); // só pergunta uma vez; depois devolve a resposta
    } catch {
      // Sem ATT, o AdMob segue com anúncios não personalizados.
    }
  }
  try {
    await ads.default().initialize();
    loadInterstitial();
    loadAppOpen();
  } catch {
    started = false;
  }
}

export function initAds() {
  if (!ads) return;
  AppState.addEventListener('change', onAppStateChange);
  // Na primeira abertura, o iPhone só pergunta sobre rastreamento depois das boas-vindas.
  if (Platform.OS === 'ios' && !store.get().onboarded) return;
  startAds();
}

/** Chamado ao sair das boas-vindas ("Montar minha colinha"). */
export function onOnboardingFinished() {
  startAds();
}

/** Interstitial ao adicionar candidato (respeitando o intervalo mínimo). */
export function showInterstitial() {
  if (!interstitial || !interstitialLoaded) return;
  if (Date.now() - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return;
  lastInterstitialAt = Date.now();
  interstitial.show().catch(() => {});
}

/** Banner adaptativo (tela da colinha). Some quando não há AdMob. */
export function Banner() {
  if (!ads) return null;
  const { BannerAd, BannerAdSize, TestIds } = ads;
  return (
    <View className="items-center">
      <BannerAd
        unitId={AD_UNITS.banner ?? TestIds.ADAPTIVE_BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}
