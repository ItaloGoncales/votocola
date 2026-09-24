import { Linking, Pressable, View } from 'react-native';
import type { SocialLink } from '@/api';
import { SocialIcon } from '../atoms/social-icon';
import { Text } from '../atoms/text';

const LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
  threads: 'Threads',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  site: 'Site',
};

/**
 * Molécula: redes sociais declaradas ao TSE. Abre no app da rede quando instalado (links
 * universais), senão no navegador.
 */
export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (!links.length) return null;
  return (
    <View className="gap-3 rounded-3xl border border-line bg-surface p-4">
      <Text className="text-lg font-bold">Redes sociais</Text>
      <View className="flex-row flex-wrap gap-2">
        {links.map((link) => (
          <Pressable
            key={link.url}
            accessibilityRole="link"
            accessibilityLabel={`Abrir ${LABELS[link.network] ?? link.network}`}
            onPress={() => Linking.openURL(link.url).catch(() => {})}
            className="h-10 flex-row items-center gap-2 rounded-full border border-line bg-raised px-4 active:bg-line"
          >
            <SocialIcon network={link.network} />
            <Text className="text-sm font-semibold">{LABELS[link.network] ?? link.network}</Text>
            <Text tone="sky" className="text-sm">
              ↗
            </Text>
          </Pressable>
        ))}
      </View>
      <Text tone="muted" className="text-xs">
        Links informados pela candidatura ao TSE.
      </Text>
    </View>
  );
}
