import { View } from 'react-native';
import type { PoliticalPosition } from '@/api';
import { Text } from './text';

/** Ordem do espectro: define a cor e qual ponto da régua fica aceso. */
const SCALE: PoliticalPosition[] = ['LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'RIGHT'];

/** Escala divergente laranja <-> azul: distinguível nos tipos comuns de daltonismo. */
const COLORS: Record<PoliticalPosition, string> = {
  LEFT: 'bg-pos-left',
  CENTER_LEFT: 'bg-pos-center-left',
  CENTER: 'bg-pos-center',
  CENTER_RIGHT: 'bg-pos-center-right',
  RIGHT: 'bg-pos-right',
};

/**
 * Átomo: selo do espectro político. A informação não depende só da cor: tem o rótulo e uma
 * régua de 5 pontos em que o ponto aceso marca a posição (esquerda -> direita).
 */
export function PositionBadge({
  position,
  label,
}: {
  position: PoliticalPosition | null;
  label: string | null;
}) {
  if (!position || !label) return null;
  const index = SCALE.indexOf(position);
  return (
    <View
      accessibilityLabel={`Posição política: ${label}`}
      className={`flex-row items-center gap-2 self-start rounded-full py-0.5 pl-2 pr-2.5 ${COLORS[position]}`}
    >
      <View className="flex-row items-center gap-0.5">
        {SCALE.map((_, i) => (
          <View
            key={i}
            className={
              i === index ? 'h-2 w-2 rounded-full bg-canvas' : 'h-1 w-1 rounded-full bg-canvas/35'
            }
          />
        ))}
      </View>
      <Text tone="onLight" className="text-xs font-bold">
        {label}
      </Text>
    </View>
  );
}
