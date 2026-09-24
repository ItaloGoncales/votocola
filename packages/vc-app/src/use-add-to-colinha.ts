import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { showInterstitial } from '@/ads';
import type { BallotSlot, CandidateSummary } from '@/api';
import { checkAdd, slotsFor, toPick, type Pick } from '@/domain/colinha';
import { store } from '@/store';
import { countOnce } from '@/track';

function commit(slot: BallotSlot, pick: Pick) {
  store.pick(slot.key, pick);
  countOnce('PICK', pick.id);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  router.navigate('/');
  showInterstitial();
}

/**
 * Adiciona o candidato à colinha: valida estado/cargo/repetição, escolhe o espaço (ou pergunta
 * qual substituir quando os dois de senador estão ocupados) e volta para a colinha.
 */
export function addToColinha(candidate: CandidateSummary, slotKey?: string) {
  const { uf, ballot, picks } = store.get();
  if (!uf) return router.navigate('/estado');
  const pick = toPick(candidate);

  const candidates = slotKey
    ? ballot.filter((s) => s.key === slotKey && s.office === pick.office)
    : slotsFor(pick, ballot, picks);
  const slots = candidates.length ? candidates : slotsFor(pick, ballot, picks);
  const target = slots[0];
  if (!target) {
    return Alert.alert('Cargo indisponível', 'Esse cargo não está na sua colinha.');
  }

  const check = checkAdd(pick, target, uf, picks, ballot);
  if (!check.ok) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    return Alert.alert(check.title, check.message);
  }

  const current = picks[target.key];
  if (!current || current.id === pick.id) return commit(target, pick);

  // Espaço(s) ocupado(s): pergunta qual trocar.
  Alert.alert('Substituir escolha?', `Onde colocar ${pick.ballotName}?`, [
    ...slots
      .filter((s) => checkAdd(pick, s, uf, picks, ballot).ok)
      .map((s) => ({
        text: `${s.label}: trocar ${picks[s.key]?.ballotName ?? 'vazio'}`,
        onPress: () => commit(s, pick),
      })),
    { text: 'Cancelar', style: 'cancel' as const },
  ]);
}

/** Espaço da colinha em que o candidato está, se estiver. */
export const slotOf = (candidateId: string): string | undefined =>
  Object.entries(store.get().picks).find(([, p]) => p.id === candidateId)?.[0];

/** Botão +/✓ da busca: remove se já está na colinha, senão adiciona (sem sair da busca ao remover). */
export function toggleInColinha(candidate: CandidateSummary, slotKey?: string) {
  const current = slotOf(candidate.id);
  if (current) {
    store.remove(current);
    Haptics.selectionAsync().catch(() => {});
    return;
  }
  addToColinha(candidate, slotKey);
}
