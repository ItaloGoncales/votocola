import { View } from 'react-native';
import { Text } from './text';

/** Átomo: número em quadradinhos, como no visor da urna. */
export function NumberBoxes({
  number,
  digits,
  size = 'md',
}: {
  number: string | null;
  digits: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const box = { sm: 'h-8 w-6', md: 'h-10 w-8', lg: 'h-14 w-11' }[size];
  const font = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }[size];
  const chars = (number ?? '').padEnd(digits, ' ').slice(0, digits).split('');
  return (
    <View
      className="flex-row gap-1"
      accessibilityLabel={number ? `Número ${number}` : 'Sem número'}
    >
      {chars.map((ch, i) => (
        <View
          key={i}
          className={`${box} items-center justify-center rounded-md border ${
            number ? 'border-white bg-white' : 'border-dashed border-line'
          }`}
        >
          <Text
            tone="onLight"
            className={`${font} font-bold`}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {ch.trim()}
          </Text>
        </View>
      ))}
    </View>
  );
}
