import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, View } from 'react-native';
import { AD_UNITS } from '@/config';

type AdsModule = typeof import('react-native-google-mobile-ads');

/**
 * O AdMob é nativo: não existe no Expo Go nem na web. Lá os anúncios viram no-op; num
 * development build (`expo run:android|ios` ou EAS) eles funcionam normalmente.
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
let loaded = false;

function loadInterstitial() {
  if (!ads) return;
  const unit = AD_UNITS.interstitial ?? ads.TestIds.INTERSTITIAL;
  interstitial = ads.InterstitialAd.createForAdRequest(unit);
  loaded = false;
  interstitial.addAdEventListener(ads.AdEventType.LOADED, () => {
    loaded = true;
  });
  interstitial.addAdEventListener(ads.AdEventType.CLOSED, loadInterstitial);
  interstitial.addAdEventListener(ads.AdEventType.ERROR, () => {
    loaded = false;
  });
  interstitial.load();
}

export function initAds() {
  if (!ads) return;
  ads
    .default()
    .initialize()
    .then(loadInterstitial)
    .catch(() => {});
}

/** Interstitial ao adicionar candidato (respeitando o intervalo mínimo). */
export function showInterstitial() {
  if (!interstitial || !loaded) return;
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
