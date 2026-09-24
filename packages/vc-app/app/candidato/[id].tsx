import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { suppressAppOpen } from '@/ads';
import { fetchCandidate, type Candidate } from '@/api';
import { canVoteIn } from '@/domain/colinha';
import { stateName } from '@/domain/states';
import { store, useStore } from '@/store';
import { countOnce } from '@/track';
import { addToColinha } from '@/use-add-to-colinha';
import {
  Avatar,
  Button,
  ElectionHistory,
  NumberBoxes,
  PositionBadge,
  Screen,
  ScreenHeader,
  SocialLinks,
  Text,
  useBottomInset,
  ViewCount,
} from '@/ui';
import { colors } from '@/theme';

function Info({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === '') return null;
  return (
    <View className="flex-row justify-between gap-4 py-2.5">
      <Text tone="muted">{label}</Text>
      <Text className="flex-1 text-right font-medium">{value}</Text>
    </View>
  );
}

export default function CandidateScreen() {
  const { id, slot } = useLocalSearchParams<{ id: string; slot?: string }>();
  const uf = useStore((s) => s.uf);
  const picks = useStore((s) => s.picks);
  const bottomInset = useBottomInset();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCandidate(id)
      .then((c) => {
        setCandidate(c);
        countOnce('VIEW', c.id);
      })
      .catch(() => setError(true));
  }, [id]);

  if (!candidate) {
    return (
      <Screen>
        <ScreenHeader title="Candidato" />
        <View className="flex-1 items-center justify-center p-8">
          {error ? (
            <Text tone="muted">Não foi possível carregar. Verifique sua conexão.</Text>
          ) : (
            <ActivityIndicator color={colors.brand} />
          )}
        </View>
      </Screen>
    );
  }

  const c = candidate;
  const inColinha = Object.entries(picks).find(([, p]) => p.id === c.id)?.[0];
  const votable = uf ? canVoteIn(c.state, uf) : true;
  const digits = c.number.length;

  return (
    <Screen>
      <ScreenHeader title={c.ballotName} />
      <ScrollView contentContainerClassName="gap-5 p-4 pb-8">
        <View className="flex-row gap-4">
          <Avatar uri={c.photoUrl} name={c.ballotName} size={112} />
          <View className="flex-1 justify-center gap-2">
            <Text tone="muted" className="text-xs font-semibold uppercase tracking-wide">
              {c.officeLabel}
              {c.state !== 'BR' ? ` · ${stateName(c.state)}` : ''}
            </Text>
            <Text className="text-2xl font-extrabold">{c.ballotName}</Text>
            <Text tone="muted">
              {c.party.acronym} · {c.party.name}
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <PositionBadge position={c.position} label={c.positionLabel} />
              <ViewCount count={c.viewCount} label={c.viewCountLabel} />
            </View>
          </View>
        </View>

        <View className="items-center gap-2 rounded-3xl bg-surface p-4">
          <Text tone="sun" className="text-xs font-bold uppercase tracking-widest">
            Número na urna
          </Text>
          <NumberBoxes number={c.number} digits={digits} size="lg" />
        </View>

        {!c.active || (c.status && c.status !== 'DEFERIDO') ? (
          <View className="gap-1 rounded-2xl border border-sun/50 bg-surface p-3">
            <Text tone="sun" className="font-semibold">
              Candidatura: {(c.statusDetail ?? c.status ?? '').toLowerCase()}
            </Text>
            <Text tone="sun" className="text-sm">
              {c.active
                ? 'O TSE ainda não decidiu em definitivo. Os votos podem não ser contados.'
                : 'Os votos neste candidato não serão contados.'}
            </Text>
          </View>
        ) : null}
        {!votable && uf ? (
          <View className="rounded-2xl bg-surface p-3">
            <Text tone="muted">
              Você vota em {stateName(uf)}; este candidato concorre em {stateName(c.state)}.
            </Text>
          </View>
        ) : null}

        {c.attributes.length ? (
          <View className="flex-row flex-wrap gap-2">
            {c.attributes.map((a) => (
              <View key={a.slug} className="rounded-full bg-raised px-3 py-1">
                <Text className="text-xs font-medium">{a.name}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {c.planSummary || c.planUrl ? (
          <View className="gap-3 rounded-3xl border border-line bg-surface p-4">
            <Text className="text-lg font-bold">Plano de governo</Text>
            {c.planSummary ? <Text className="leading-6">{c.planSummary}</Text> : null}
            {c.planUrl ? (
              <Button
                variant="secondary"
                label="Ler plano completo (PDF)"
                onPress={() => {
                  suppressAppOpen();
                  WebBrowser.openBrowserAsync(c.planUrl!);
                }}
              />
            ) : null}
          </View>
        ) : null}

        <View className="rounded-3xl border border-line bg-surface px-4 py-1">
          <Info label="Nome completo" value={c.fullName} />
          <Info label="Idade" value={c.age !== null ? `${c.age} anos` : null} />
          <Info label="Ocupação" value={c.occupation} />
          <Info label="Escolaridade" value={c.education} />
          <Info label="Federação" value={c.party.federationName} />
          <Info
            label="Coligação"
            value={
              c.coalitionName
                ? `${c.coalitionName} (${c.coalitionParties ?? ''})`.replace(' ()', '')
                : null
            }
          />
          <Info label="Reeleição" value={c.reelection ? 'Sim' : 'Não'} />
          <Info label="Situação" value={c.statusDetail ?? c.status} />
        </View>
        <ElectionHistory items={c.history} />
        <SocialLinks links={c.socialLinks} />

        <Text tone="muted" className="text-center text-xs">
          Fonte: TSE — Portal de Dados Abertos. O VotoCola não é afiliado ao TSE. Posição política é
          uma classificação editorial do partido.
        </Text>
      </ScrollView>

      <View
        className="border-t border-line bg-canvas px-4 pt-4"
        style={{ paddingBottom: bottomInset }}
      >
        {inColinha ? (
          <Button
            variant="danger"
            label="Remover da colinha"
            onPress={() => store.remove(inColinha)}
          />
        ) : (
          <Button label="Adicionar à colinha" onPress={() => addToColinha(c, slot)} />
        )}
      </View>
    </Screen>
  );
}
