import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from './text';

/** Fontes carregadas em `app/_layout.tsx` (Fredoka, próxima da letra do logo). */
export const LOGO_FONT = 'Fredoka_700Bold';

const SIZES = {
  sm: { font: 16, mark: 22 },
  md: { font: 30, mark: 40 },
  lg: { font: 40, mark: 56 },
};

/** Átomo: logo VotoCola (urna + "Voto" azul, "Cola" verde, ponto amarelo). */
export function Logo({ size = 'md', mark = true }: { size?: keyof typeof SIZES; mark?: boolean }) {
  const s = SIZES[size];
  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityRole="header"
      accessibilityLabel="VotoCola"
    >
      {mark ? (
        <Image
          source={require('../../../assets/brand/mark.png')}
          style={{ width: s.mark, height: s.mark }}
          contentFit="contain"
        />
      ) : null}
      <Text style={{ fontFamily: LOGO_FONT, fontSize: s.font, lineHeight: s.font * 1.2 }}>
        <Text tone="voto" style={{ fontFamily: LOGO_FONT }}>
          Voto
        </Text>
        <Text tone="brand" style={{ fontFamily: LOGO_FONT }}>
          Cola
        </Text>
        <Text tone="sun" style={{ fontFamily: LOGO_FONT }}>
          .
        </Text>
      </Text>
    </View>
  );
}
