import { View } from 'react-native';
import type { BallotSlot } from '@/api';
import { SHARE_URL } from '@/config';
import type { Picks } from '@/domain/colinha';
import { stateName } from '@/domain/states';
import { Logo } from '../atoms/logo';
import { Text } from '../atoms/text';
import { SlotCard } from '../molecules/slot-card';

/**
 * Organismo: a colinha em si. É esta view que vira imagem ao compartilhar, por isso o
 * cabeçalho e o rodapé com o link do app ficam dentro dela.
 */
export function ColinhaSheet({
  uf,
  ballot,
  picks,
  onSlotPress,
  onSlotLongPress,
}: {
  uf: string;
  ballot: BallotSlot[];
  picks: Picks;
  onSlotPress?: (slot: BallotSlot) => void;
  onSlotLongPress?: (slot: BallotSlot) => void;
}) {
  return (
    <View className="gap-3 rounded-3xl bg-surface p-4">
      <View className="flex-row items-end justify-between">
        <View>
          <Text tone="sun" className="text-xs font-bold uppercase tracking-widest">
            Eleições 2026 · 1º turno
          </Text>
          <Text className="text-2xl font-extrabold">Minha colinha</Text>
        </View>
        <Text tone="muted" className="text-sm font-semibold">
          {stateName(uf)}
        </Text>
      </View>
      {ballot.map((slot, i) => (
        <SlotCard
          key={slot.key}
          index={i}
          slot={slot}
          pick={picks[slot.key]}
          onPress={onSlotPress ? () => onSlotPress(slot) : undefined}
          onLongPress={onSlotLongPress ? () => onSlotLongPress(slot) : undefined}
        />
      ))}
      <View className="items-center gap-0.5 pt-1">
        <Text tone="muted" className="text-xs">
          Na urna, digite os números nesta ordem. Leve sua colinha impressa ou anotada.
        </Text>
        <View className="flex-row items-center gap-2 pt-1">
          <Text tone="muted" className="text-sm">
            Monte a sua no
          </Text>
          <Logo size="sm" />
          <Text tone="muted" className="text-sm">
            {SHARE_URL}
          </Text>
        </View>
      </View>
    </View>
  );
}
