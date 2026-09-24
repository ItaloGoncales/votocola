import { View } from 'react-native';
import type { ElectionHistory as History } from '@/api';
import { Text } from '../atoms/text';

/**
 * Molécula: candidaturas anteriores (turno final). O resultado aparece em texto, com ✓ em quem foi
 * eleito: a informação não depende só da cor.
 */
export function ElectionHistory({ items }: { items: History[] }) {
  if (!items.length) return null;
  const wins = items.filter((h) => h.elected).length;
  return (
    <View className="gap-1 rounded-3xl border border-line bg-surface px-4 pb-2 pt-4">
      <Text className="text-lg font-bold">Histórico eleitoral</Text>
      <Text tone="muted" className="pb-1 text-xs">
        {items.length} {items.length === 1 ? 'candidatura anterior' : 'candidaturas anteriores'}
        {wins ? ` · eleito(a) ${wins} ${wins === 1 ? 'vez' : 'vezes'}` : ''}
      </Text>
      {items.map((h, i) => (
        <View
          key={`${h.year}-${h.office}-${i}`}
          className={`flex-row gap-3 py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}
        >
          <Text className="w-11 font-bold" style={{ fontVariant: ['tabular-nums'] }}>
            {h.year}
          </Text>
          <View className="flex-1 gap-0.5">
            <Text className="font-semibold">{h.office}</Text>
            <Text tone="muted" className="text-xs">
              {[h.place, h.party].filter(Boolean).join(' · ')}
            </Text>
          </View>
          {h.result ? (
            <Text tone={h.elected ? 'brand' : 'muted'} className="text-sm font-semibold">
              {h.elected ? `✓ ${h.result}` : h.result}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
