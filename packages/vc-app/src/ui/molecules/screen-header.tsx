import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from '../atoms/text';

/** Molécula: cabeçalho simples com voltar. */
export function ScreenHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View className="h-14 flex-row items-center gap-2 px-2">
      {router.canGoBack() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-raised"
        >
          <Text className="text-2xl">‹</Text>
        </Pressable>
      ) : (
        <View className="w-2" />
      )}
      <Text className="flex-1 text-lg font-bold" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
