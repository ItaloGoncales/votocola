import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from './text';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

/** Átomo: foto do candidato (proporção 3x4 do TSE) com iniciais como fallback. */
export function Avatar({
  uri,
  name,
  size = 56,
}: {
  uri: string | null;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: Math.round(size * 1.25), borderRadius: size * 0.18 };
  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={style}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        recyclingKey={uri}
        onError={() => setFailed(true)}
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }
  return (
    <View style={style} className="items-center justify-center bg-raised">
      <Text tone="brand" className="font-bold" style={{ fontSize: size * 0.32 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
