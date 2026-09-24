import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';
import { Text } from './text';

/** Ícone de olho (traço no estilo Lucide). */
function EyeIcon({ size = 14, color = colors.muted }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
      <Circle cx={12} cy={12} r={3} />
    </Svg>
  );
}

/**
 * Átomo: visualizações do perfil (olho + número compacto vindo da API). Não aparece sem
 * visualizações ou quando a API desliga a exibição (VIEW_COUNT_VISIBLE=false).
 */
export function ViewCount({ count, label }: { count: number | null; label: string | null }) {
  if (!count || !label) return null;
  return (
    <View
      className="flex-row items-center gap-1"
      accessibilityLabel={`${label} ${count === 1 ? 'visualização' : 'visualizações'}`}
    >
      <EyeIcon />
      <Text tone="muted" className="text-xs font-semibold">
        {label}
      </Text>
    </View>
  );
}
