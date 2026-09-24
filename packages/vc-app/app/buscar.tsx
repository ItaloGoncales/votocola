import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, ScrollView, View } from 'react-native';
import {
  fetchAttributes,
  type Attribute,
  type CandidateFilter,
  type CandidateSummary,
  type Office,
  type PoliticalPosition,
} from '@/api';
import { stateName } from '@/domain/states';
import { useStore } from '@/store';
import { colors } from '@/theme';
import { toggleInColinha } from '@/use-add-to-colinha';
import { useCandidateSearch } from '@/use-candidate-search';
import { useDebounced } from '@/use-debounced';
import {
  Button,
  CandidateRow,
  Chip,
  Screen,
  ScreenHeader,
  SearchInput,
  Text,
  useBottomInset,
} from '@/ui';

const OFFICE_SHORT: Record<Office, string> = {
  FEDERAL_DEPUTY: 'Dep. federal',
  STATE_DEPUTY: 'Dep. estadual',
  DISTRICT_DEPUTY: 'Dep. distrital',
  SENATOR: 'Senador',
  GOVERNOR: 'Governador',
  PRESIDENT: 'Presidente',
};

const POSITIONS: [PoliticalPosition, string][] = [
  ['LEFT', 'Esquerda'],
  ['CENTER_LEFT', 'Centro-esq.'],
  ['CENTER', 'Centro'],
  ['CENTER_RIGHT', 'Centro-dir.'],
  ['RIGHT', 'Direita'],
];

const toggle = <T,>(list: T[], item: T) =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

const keyExtractor = (c: CandidateSummary) => c.id;
const Separator = () => <View className="ml-20 h-px bg-line" />;

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-4"
    >
      {children}
    </ScrollView>
  );
}

export default function SearchScreen() {
  const params = useLocalSearchParams<{ slot?: string; office?: Office }>();
  const uf = useStore((s) => s.uf);
  const ballot = useStore((s) => s.ballot);
  const picks = useStore((s) => s.picks);
  const pickedIds = useMemo(() => new Set(Object.values(picks).map((p) => p.id)), [picks]);

  const [query, setQuery] = useState('');
  const [office, setOffice] = useState<Office | undefined>(params.office);
  const [onlyMyState, setOnlyMyState] = useState(true);
  const [positions, setPositions] = useState<PoliticalPosition[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
  const debouncedQuery = useDebounced(query);
  const bottomInset = useBottomInset();
  const offices = [...new Set(ballot.map((s) => s.office))];

  useEffect(() => {
    fetchAttributes()
      .then(setAllAttributes)
      .catch(() => {});
  }, []);

  const filter: CandidateFilter = {
    state: onlyMyState && uf ? uf : undefined,
    office,
    query: debouncedQuery || undefined,
    positions: positions.length ? positions : undefined,
    attributes: attributes.length ? attributes : undefined,
  };
  const { items, total, status, hasMore, loadMore, retry } = useCandidateSearch(filter);

  // Callbacks estáveis: a linha memoizada não re-renderiza a cada tecla digitada.
  const slot = params.slot;
  const openCandidate = useCallback(
    (c: CandidateSummary) =>
      router.push({ pathname: '/candidato/[id]', params: { id: c.id, ...(slot ? { slot } : {}) } }),
    [slot],
  );
  const toggleCandidate = useCallback((c: CandidateSummary) => toggleInColinha(c, slot), [slot]);
  const renderItem = useCallback(
    ({ item }: { item: CandidateSummary }) => (
      <CandidateRow
        candidate={item}
        added={pickedIds.has(item.id)}
        onPress={openCandidate}
        onToggle={toggleCandidate}
      />
    ),
    [pickedIds, openCandidate, toggleCandidate],
  );

  const slotLabel = slot ? ballot.find((s) => s.key === slot)?.label : undefined;

  const footer =
    status === 'loadingMore' ? (
      <ActivityIndicator className="p-6" color={colors.brand} />
    ) : status === 'errorMore' ? (
      <View className="items-center gap-2 p-6">
        <Text tone="muted">Não foi possível carregar mais.</Text>
        <Button variant="secondary" label="Tentar de novo" onPress={retry} />
      </View>
    ) : !hasMore && items.length > 0 ? (
      <Text tone="muted" className="p-6 text-center text-xs">
        Fim da lista
      </Text>
    ) : null;

  return (
    <Screen>
      <ScreenHeader title={slotLabel ? `Escolher: ${slotLabel}` : 'Buscar candidatos'} />
      <View className="gap-3 pb-3">
        <View className="px-4">
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nome, número ou partido"
            autoFocus={!slot}
          />
        </View>
        <ChipRow>
          <Chip
            label={uf ? `Só ${stateName(uf)}` : 'Meu estado'}
            selected={onlyMyState}
            onPress={() => setOnlyMyState(true)}
          />
          <Chip
            label="Todo o Brasil"
            selected={!onlyMyState}
            onPress={() => setOnlyMyState(false)}
          />
          <View className="w-2" />
          {offices.map((o) => (
            <Chip
              key={o}
              label={OFFICE_SHORT[o]}
              selected={office === o}
              onPress={() => setOffice(office === o ? undefined : o)}
            />
          ))}
        </ChipRow>
        <ChipRow>
          {POSITIONS.map(([p, label]) => (
            <Chip
              key={p}
              label={label}
              selected={positions.includes(p)}
              onPress={() => setPositions(toggle(positions, p))}
            />
          ))}
          {allAttributes.length ? <View className="w-2" /> : null}
          {allAttributes.map((a) => (
            <Chip
              key={a.slug}
              label={a.name}
              selected={attributes.includes(a.slug)}
              onPress={() => setAttributes(toggle(attributes, a.slug))}
            />
          ))}
        </ChipRow>
      </View>

      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          items.length ? (
            <Text tone="muted" className="px-4 pb-1 text-xs">
              {total} {total === 1 ? 'candidato' : 'candidatos'}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          status === 'loading' ? (
            <ActivityIndicator className="p-10" color={colors.brand} />
          ) : (
            <View className="items-center gap-3 p-10">
              <Text className="text-base font-semibold">
                {status === 'error' ? 'Não foi possível buscar' : 'Nenhum candidato encontrado'}
              </Text>
              <Text tone="muted" className="text-center">
                {status === 'error'
                  ? 'Verifique sua conexão e tente de novo.'
                  : 'Tente outro nome ou tire filtros.'}
              </Text>
              {status === 'error' ? (
                <Button variant="secondary" label="Tentar de novo" onPress={retry} />
              ) : null}
            </View>
          )
        }
        ListFooterComponent={footer}
        contentContainerStyle={{ paddingBottom: bottomInset }}
      />
    </Screen>
  );
}
