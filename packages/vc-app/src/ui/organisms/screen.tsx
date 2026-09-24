import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Organismo: base de toda tela. O app ocupa a tela inteira (edge-to-edge no Android), então as
 * margens do sistema (status bar, barra de navegação/gestos) vêm de `useSafeAreaInsets` e viram
 * padding explícito. `bottom` reserva a barra de baixo para a tela toda; telas com lista ou rodapé
 * fixo usam `useBottomInset` só onde precisam.
 */
export function Screen({ children, bottom = false }: { children: ReactNode; bottom?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-canvas"
      style={{ paddingTop: insets.top, paddingBottom: bottom ? insets.bottom : 0 }}
    >
      {children}
    </View>
  );
}

/** Espaço da barra de navegação/gestos + folga, para o fim de listas e rodapés fixos. */
export function useBottomInset(extra = 16): number {
  return useSafeAreaInsets().bottom + extra;
}
