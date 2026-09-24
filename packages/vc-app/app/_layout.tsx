import '../global.css';
import { Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initAds } from '@/ads';
import { store, useStore } from '@/store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);
  // Se a fonte falhar, segue com a do sistema em vez de travar no splash.
  const [fontsLoaded, fontError] = useFonts({ Fredoka_700Bold });
  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    store.hydrate();
    initAds();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}
      />
    </>
  );
}
