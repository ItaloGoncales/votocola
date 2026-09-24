import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { BallotSlot } from '@/api';
import { canVoteIn, type Pick, type Picks } from '@/domain/colinha';

/** Tudo fica no aparelho: não há conta de usuário. */
export interface AppState {
  hydrated: boolean;
  /** UF do eleitor; nula até ele escolher. */
  uf: string | null;
  /** Espaços da colinha da UF (cache do `ballot` da API, para abrir offline). */
  ballot: BallotSlot[];
  picks: Picks;
  /**
   * Candidatos já contados neste aparelho (`VIEW:id`, `PICK:id`). Fica só aqui: o servidor recebe
   * apenas "+1" por candidato, sem nada que identifique o aparelho.
   */
  counted: Record<string, true>;
  /** Já passou pela tela de boas-vindas. */
  onboarded: boolean;
}

const STORAGE_KEY = 'votocerto:v1';

const initialState = (counted: Record<string, true> = {}): AppState => ({
  hydrated: false,
  uf: null,
  ballot: [],
  picks: {},
  counted,
  onboarded: false,
});

let state: AppState = initialState();
const listeners = new Set<() => void>();

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  const { uf, ballot, picks, counted, onboarded } = state;
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ uf, ballot, picks, counted, onboarded }),
  ).catch(() => {});
}

export const store = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const { deviceId: _legacy, ...saved } = (raw ? JSON.parse(raw) : {}) as Partial<AppState> & {
        deviceId?: string;
      };
      // Quem já usava o app antes das boas-vindas (já tem UF) não precisa vê-las.
      state = { ...state, ...saved, onboarded: saved.onboarded ?? !!saved.uf, hydrated: true };
    } catch {
      state = { ...state, hydrated: true };
    }
    listeners.forEach((l) => l());
  },

  /** Marca como contado; devolve false se este aparelho já tinha contado o candidato. */
  markCounted(kind: 'VIEW' | 'PICK', candidateId: string): boolean {
    const key = `${kind}:${candidateId}`;
    if (state.counted[key]) return false;
    set({ counted: { ...state.counted, [key]: true } });
    return true;
  },

  finishOnboarding() {
    set({ onboarded: true });
  },

  /**
   * Volta o app ao estado de instalação nova (só desenvolvimento). Mantém a lista do que já foi
   * contado para não inflar a popularidade a cada teste.
   */
  async reset() {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    state = { ...initialState(state.counted), hydrated: true };
    listeners.forEach((l) => l());
  },

  /** Troca a UF; escolhas de outra UF saem da colinha (presidente fica). */
  setState(uf: string, ballot: BallotSlot[]) {
    const keys = new Set(ballot.map((s) => s.key));
    const picks = Object.fromEntries(
      Object.entries(state.picks).filter(([key, p]) => keys.has(key) && canVoteIn(p.state, uf)),
    );
    set({ uf, ballot, picks });
  },

  setBallot(ballot: BallotSlot[]) {
    set({ ballot });
  },

  pick(slotKey: string, candidate: Pick) {
    set({ picks: { ...state.picks, [slotKey]: candidate } });
  },

  remove(slotKey: string) {
    const { [slotKey]: _removed, ...picks } = state.picks;
    set({ picks });
  },

  clear() {
    set({ picks: {} });
  },
};

/** O seletor deve devolver valores estáveis (nada de objeto novo a cada chamada). */
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()));
}
