import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { LEGAL_URLS } from '@/config';
import { countdownLabel } from '@/domain/election';
import { store } from '@/store';
import { Button, Logo, Screen, Text, useBottomInset } from '@/ui';

const STEPS = [
  { title: 'Escolha seu estado', text: 'Só quem vai aparecer na sua urna, na ordem de votação.' },
  { title: 'Conheça e escolha', text: 'Foto, número, partido, histórico e plano de governo.' },
  { title: 'Leve sua colinha', text: 'Compartilhe ou anote: o celular não entra na cabine.' },
];

const TRUST = ['Sem cadastro', 'Dados oficiais do TSE', 'Gratuito'];

/** Primeira abertura do app: o que é, como funciona e o convite para começar. */
export default function WelcomeScreen() {
  const bottomInset = useBottomInset();
  const countdown = countdownLabel();
  // Telas baixas (ex.: 360x640): troca a urna grande pelo logo com a urna pequena ao lado.
  const compact = useWindowDimensions().height < 720;

  const start = () => {
    store.finishOnboarding();
    router.replace('/estado');
  };

  return (
    <Screen>
      {/* Pensada para caber numa tela sem rolar; a rolagem só entra em telas muito pequenas. */}
      <ScrollView contentContainerClassName="grow justify-center gap-4 px-6 py-3">
        <View className="items-center gap-2">
          {compact ? null : (
            <Image
              source={require('../assets/brand/mark.png')}
              style={{ width: 78, height: 78 }}
              contentFit="contain"
              accessibilityIgnoresInvertColors
            />
          )}
          <Logo size="md" mark={compact} />
          {countdown ? (
            <View className="mt-1 rounded-full border border-sun/50 bg-surface px-3 py-1">
              <Text tone="sun" className="text-xs font-bold">
                {countdown} · 4 de outubro
              </Text>
            </View>
          ) : null}
        </View>

        <View className="gap-1">
          <Text className="text-center text-2xl font-extrabold leading-8">
            Vote sem esquecer nenhum número.
          </Text>
          <Text tone="muted" className="text-center text-sm">
            Monte sua colinha para as eleições de 2026 em poucos minutos.
          </Text>
        </View>

        <View className="gap-2">
          {STEPS.map((step, i) => (
            <View
              key={step.title}
              className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
                <Text tone="inverse" className="text-sm font-extrabold">
                  {i + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold">{step.title}</Text>
                <Text tone="muted" className="text-xs leading-4">
                  {step.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap justify-center gap-x-3 gap-y-1">
          {TRUST.map((item) => (
            <Text key={item} tone="muted" className="text-xs font-semibold">
              ✓ {item}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View
        className="border-t border-line bg-canvas px-6 pt-3"
        style={{ paddingBottom: bottomInset }}
      >
        <Button label="Montar minha colinha" onPress={start} />
        <Text tone="muted" className="pt-2 text-center text-[11px] leading-4">
          Ao continuar, você aceita os{' '}
          <Text
            tone="brand"
            accessibilityRole="link"
            className="text-[11px] font-semibold underline"
            onPress={() => WebBrowser.openBrowserAsync(LEGAL_URLS.terms)}
          >
            Termos de uso
          </Text>{' '}
          e a{' '}
          <Text
            tone="brand"
            accessibilityRole="link"
            className="text-[11px] font-semibold underline"
            onPress={() => WebBrowser.openBrowserAsync(LEGAL_URLS.privacy)}
          >
            Política de privacidade
          </Text>
          . O VotoCola não é afiliado ao TSE.
        </Text>
      </View>
    </Screen>
  );
}
