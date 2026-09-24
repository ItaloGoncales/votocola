import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { Text } from './text';
import { colors } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const VARIANTS: Record<Variant, { box: string; text: 'inverse' | 'default' | 'brand' | 'danger' }> =
  {
    primary: { box: 'bg-brand active:bg-brand-press', text: 'inverse' },
    secondary: {
      box: 'border border-line bg-surface active:bg-raised',
      text: 'default',
    },
    ghost: { box: 'active:bg-raised', text: 'brand' },
    danger: { box: 'border border-danger/40 active:bg-raised', text: 'danger' },
  };

/** Átomo: botão com variantes e estado de carregamento. */
export function Button({
  label,
  loading,
  disabled,
  variant = 'primary',
  className,
  ...props
}: Omit<PressableProps, 'children'> & {
  label: string;
  loading?: boolean;
  variant?: Variant;
  className?: string;
}) {
  const inactive = disabled || loading;
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      {...props}
      className={`h-12 flex-row items-center justify-center rounded-2xl px-5 ${v.box} ${inactive ? 'opacity-50' : ''} ${className ?? ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.canvas : colors.brand} />
      ) : (
        <Text tone={v.text} className="text-base font-semibold">
          {label}
        </Text>
      )}
    </Pressable>
  );
}
