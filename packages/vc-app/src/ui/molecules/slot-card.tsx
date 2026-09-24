import { Pressable, View } from 'react-native';
import type { BallotSlot } from '@/api';
import type { Pick } from '@/domain/colinha';
import { Avatar } from '../atoms/avatar';
import { NumberBoxes } from '../atoms/number-boxes';
import { Text } from '../atoms/text';

/** Largura da foto no cartão (a altura segue a proporção 3x4 do TSE). */
const PHOTO = 34;

/**
 * Molécula: um espaço da colinha (ordem, foto, cargo, escolhido e número). Também compõe a imagem
 * compartilhada; o PDF de impressão não usa fotos.
 */
export function SlotCard({
  index,
  slot,
  pick,
  onPress,
  onLongPress,
}: {
  index: number;
  slot: BallotSlot;
  pick?: Pick;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityHint={pick ? 'Toque para ver, segure para remover' : 'Toque para escolher'}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-raised px-3 py-2.5 active:bg-line"
    >
      {/* Ordem na urna como selo no canto da foto: economiza a largura de um círculo à parte. */}
      <View>
        {pick ? (
          <Avatar uri={pick.photoUrl} name={pick.ballotName} size={PHOTO} />
        ) : (
          // Mesmo tamanho da foto, para os nomes ficarem alinhados entre os cargos.
          <View
            className="border border-dashed border-line"
            style={{ width: PHOTO, height: Math.round(PHOTO * 1.25), borderRadius: PHOTO * 0.18 }}
          />
        )}
        <View
          className={`absolute -left-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full border-2 border-raised ${pick ? 'bg-brand' : 'bg-line'}`}
        >
          <Text
            tone={pick ? 'inverse' : 'default'}
            className="text-[10px] font-extrabold leading-3"
          >
            {index + 1}
          </Text>
        </View>
      </View>
      <View className="flex-1 gap-0.5">
        <Text tone="muted" className="text-[11px] font-semibold uppercase tracking-wide">
          {slot.label}
        </Text>
        {pick ? (
          <Text className="text-[15px] font-bold" numberOfLines={1}>
            {pick.ballotName}{' '}
            <Text tone="muted" className="text-xs font-semibold">
              {pick.partyAcronym}
            </Text>
          </Text>
        ) : (
          <Text tone="brand" className="text-sm font-semibold">
            Escolher →
          </Text>
        )}
      </View>
      <NumberBoxes number={pick?.number ?? null} digits={slot.digits} size="sm" />
    </Pressable>
  );
}
