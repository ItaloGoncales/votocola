import { Redirect, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Banner } from '@/ads';
import { fetchBallot } from '@/api';
import { filledCount } from '@/domain/colinha';
import { shareColinhaPdf } from '@/print';
import { shareColinha } from '@/share';
import { store, useStore } from '@/store';
import { Button, ColinhaSheet, Logo, Screen, Text } from '@/ui';

export default function ColinhaScreen() {
  const uf = useStore((s) => s.uf);
  const onboarded = useStore((s) => s.onboarded);
  const ballot = useStore((s) => s.ballot);
  const picks = useStore((s) => s.picks);
  const sheetRef = useRef<View>(null);

  // Atualiza os espaços da colinha em segundo plano; offline, usa o cache.
  useEffect(() => {
    if (uf)
      fetchBallot(uf)
        .then(store.setBallot)
        .catch(() => {});
  }, [uf]);

  if (!onboarded) return <Redirect href="/bem-vindo" />;
  if (!uf) return <Redirect href="/estado" />;

  const filled = filledCount(ballot, picks);

  return (
    <Screen bottom>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
        <View className="flex-row items-center justify-between">
          <Logo />
          <Pressable
            onPress={() => router.push('/estado')}
            accessibilityLabel="Trocar estado"
            className="rounded-full border border-line bg-surface px-3 py-1.5 active:bg-raised"
          >
            <Text className="text-sm font-semibold">📍 {uf} ▾</Text>
          </Pressable>
        </View>

        <Text tone="muted">
          {filled === 0
            ? 'Monte sua colinha: toque em cada cargo para escolher seu candidato.'
            : `${filled} de ${ballot.length} cargos escolhidos.`}
        </Text>

        <View ref={sheetRef} collapsable={false}>
          <ColinhaSheet
            uf={uf}
            ballot={ballot}
            picks={picks}
            onSlotPress={(slot) => {
              const pick = picks[slot.key];
              if (pick)
                router.push({
                  pathname: '/candidato/[id]',
                  params: { id: pick.id, slot: slot.key },
                });
              else
                router.push({
                  pathname: '/buscar',
                  params: { slot: slot.key, office: slot.office },
                });
            }}
            onSlotLongPress={(slot) => {
              const pick = picks[slot.key];
              if (!pick) return;
              Alert.alert('Remover da colinha?', `${pick.ballotName} (${slot.label})`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: () => store.remove(slot.key) },
              ]);
            }}
          />
        </View>

        <View className="gap-2">
          <Button
            label="Compartilhar imagem"
            disabled={filled === 0}
            onPress={() => shareColinha(sheetRef)}
          />
          {/* Mesmo sem escolhas: imprime em branco para preencher à mão. */}
          <Button
            variant="secondary"
            label="Baixar PDF para imprimir"
            onPress={() => shareColinhaPdf(uf, ballot, picks)}
          />
          <Button
            variant="secondary"
            label="Buscar candidatos"
            onPress={() => router.push('/buscar')}
          />
          {__DEV__ ? (
            <Button
              variant="danger"
              label="Resetar app (dev)"
              onPress={() =>
                Alert.alert(
                  'Resetar app?',
                  'Apaga estado e colinha deste aparelho, como numa instalação nova.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Resetar',
                      style: 'destructive',
                      onPress: async () => {
                        await store.reset();
                        router.replace('/bem-vindo');
                      },
                    },
                  ],
                )
              }
            />
          ) : null}
        </View>
      </ScrollView>
      <Banner />
    </Screen>
  );
}
