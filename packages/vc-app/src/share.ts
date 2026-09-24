import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import { Alert, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Captura a colinha como imagem (com o link do app no rodapé) e abre o compartilhamento. */
export async function shareColinha(ref: RefObject<View | null>) {
  if (!ref.current) return;
  try {
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Compartilhar', 'Compartilhamento indisponível neste aparelho.');
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Compartilhar minha colinha',
      UTI: 'public.png',
    });
  } catch {
    Alert.alert('Ops', 'Não foi possível gerar a imagem da colinha.');
  }
}
