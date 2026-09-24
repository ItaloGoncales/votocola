import { Pressable } from 'react-native';
import { Text } from './text';

/** Átomo: opção de filtro selecionável. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={`h-9 justify-center rounded-full border px-4 ${
        selected ? 'border-brand bg-brand' : 'border-line bg-surface'
      }`}
    >
      <Text tone={selected ? 'inverse' : 'default'} className="text-sm font-medium">
        {label}
      </Text>
    </Pressable>
  );
}
