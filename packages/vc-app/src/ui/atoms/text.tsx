import { Text as RNText, type TextProps } from 'react-native';

type Tone =
  'default' | 'muted' | 'danger' | 'inverse' | 'brand' | 'sun' | 'sky' | 'voto' | 'onLight';
const TONES: Record<Tone, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  danger: 'text-danger',
  /** Texto sobre as cores pastel (verde, amarelo...): escuro, para contraste. */
  inverse: 'text-canvas',
  brand: 'text-brand',
  sun: 'text-sun',
  sky: 'text-sky',
  voto: 'text-voto',
  /** Texto sobre fundo claro (ex.: os quadradinhos brancos do número). */
  onLight: 'text-canvas',
};

/** Átomo: texto com tom semântico. */
export function Text({
  tone = 'default',
  className,
  ...props
}: TextProps & { tone?: Tone; className?: string }) {
  return <RNText {...props} className={`${TONES[tone]} ${className ?? ''}`} />;
}
