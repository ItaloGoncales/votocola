import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, View } from 'react-native';
import { fetchBallot } from '@/api';
import { STATES } from '@/domain/states';
import { store, useStore } from '@/store';
import { Logo, Screen, ScreenHeader, Text, useBottomInset } from '@/ui';
import { colors } from '@/theme';

export default function StateScreen() {
  const current = useStore((s) => s.uf);
  const hasPicks = useStore((s) => Object.keys(s.picks).length > 0);
  const [loading, setLoading] = useState<string | null>(null);
  const bottomInset = useBottomInset();

  const choose = async (uf: string) => {
    if (uf === current) return router.navigate('/');
    const apply = async () => {
      setLoading(uf);
      try {
        store.setState(uf, await fetchBallot(uf));
        router.replace('/');
      } catch {
        Alert.alert('Sem conexão', 'Não foi possível carregar os cargos. Tente de novo.');
      } finally {
        setLoading(null);
      }
    };
    if (current && hasPicks) {
      Alert.alert(
        'Trocar de estado?',
        'Candidatos do estado atual saem da sua colinha (o de presidente continua).',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Trocar', onPress: apply },
        ],
      );
    } else await apply();
  };

  return (
    <Screen>
      {current ? <ScreenHeader title="Onde você vota?" /> : null}
      <FlatList
        data={STATES}
        keyExtractor={([uf]) => uf}
        numColumns={3}
        contentContainerClassName="gap-2 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        columnWrapperClassName="gap-2"
        ListHeaderComponent={
          current ? null : (
            <View className="gap-1 pb-3 pt-2">
              <Logo size="sm" mark={false} />
              <Text className="pt-1 text-xl font-bold">Em qual estado você vota?</Text>
              <Text tone="muted" className="text-sm">
                Mostramos quem está na sua urna. Fica salvo só neste aparelho.
              </Text>
            </View>
          )
        }
        renderItem={({ item: [uf, name] }) => (
          <Pressable
            onPress={() => choose(uf)}
            disabled={!!loading}
            className={`h-14 flex-1 items-center justify-center rounded-xl border ${
              uf === current ? 'border-brand bg-raised' : 'border-line bg-surface active:bg-raised'
            }`}
          >
            {loading === uf ? (
              <ActivityIndicator color={colors.brand} />
            ) : (
              <>
                <Text className="text-lg font-extrabold leading-6">{uf}</Text>
                <Text
                  tone="muted"
                  className="px-1 text-center text-[10px] leading-3"
                  numberOfLines={1}
                >
                  {name}
                </Text>
              </>
            )}
          </Pressable>
        )}
      />
    </Screen>
  );
}
