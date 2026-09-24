import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '../atoms/text';
import { colors } from '@/theme';

/** Molécula: campo de busca. */
export function SearchInput(props: TextInputProps) {
  return (
    <View className="h-12 flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-4">
      <Text tone="muted">⌕</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...props}
        className="flex-1 text-base text-ink"
      />
    </View>
  );
}
