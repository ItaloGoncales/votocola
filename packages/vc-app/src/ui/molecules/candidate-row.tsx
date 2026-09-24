import { memo } from 'react';
import { Pressable, View } from 'react-native';
import type { CandidateSummary } from '@/api';
import { Avatar } from '../atoms/avatar';
import { PositionBadge } from '../atoms/position-badge';
import { Text } from '../atoms/text';
import { ViewCount } from '../atoms/view-count';

/**
 * Molécula: candidato numa lista de busca, com botão +/✓ que adiciona ou remove da colinha. Memoizada: com callbacks
 * estáveis (que recebem o candidato), só re-renderiza quando o candidato ou `added` mudam.
 */
export const CandidateRow = memo(function CandidateRow({
  candidate,
  onPress,
  onToggle,
  added,
}: {
  candidate: CandidateSummary;
  onPress: (candidate: CandidateSummary) => void;
  onToggle?: (candidate: CandidateSummary) => void;
  added?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onPress(candidate)}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-raised"
    >
      <Avatar uri={candidate.photoUrl} name={candidate.ballotName} size={48} />
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold" numberOfLines={1}>
          {candidate.ballotName}
        </Text>
        <Text tone="muted" className="text-sm" numberOfLines={1}>
          {candidate.number} · {candidate.party.acronym} · {candidate.officeLabel}
          {candidate.state !== 'BR' ? ` · ${candidate.state}` : ''}
        </Text>
        <View className="flex-row items-center gap-2">
          <PositionBadge position={candidate.position} label={candidate.positionLabel} />
          <ViewCount count={candidate.viewCount} label={candidate.viewCountLabel} />
        </View>
      </View>
      {onToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={added ? 'Remover da colinha' : 'Adicionar à colinha'}
          onPress={() => onToggle(candidate)}
          hitSlop={8}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            added ? 'bg-brand' : 'border-2 border-brand'
          }`}
        >
          <Text tone={added ? 'inverse' : 'brand'} className="text-xl font-bold">
            {added ? '✓' : '+'}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
});
