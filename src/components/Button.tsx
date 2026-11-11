import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type ColorName } from '../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'default' | 'ghost' | 'danger' | 'dangerSolid';

const containers: Record<Variant, string> = {
  primary: 'bg-primary border-primary',
  default: 'bg-raised border-line',
  ghost: 'border-line',
  danger: 'border-failed/45',
  dangerSolid: 'bg-failed border-failed',
};

const tones: Record<Variant, ColorName> = {
  primary: 'on-primary',
  default: 'fg',
  ghost: 'fg',
  danger: 'failed',
  dangerSolid: 'on-failed',
};

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'default', loading, disabled, style }: Props) {
  const { tw, colors } = useTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={[
        tw.style(
          'h-12 flex-row items-center justify-center gap-2 rounded-xl border px-4',
          containers[variant],
          inactive && 'opacity-[0.45]',
        ),
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={colors[tones[variant]]} />}
      <AppText variant="body" tone={tones[variant]} style={tw`font-sans-semibold`}>
        {label}
      </AppText>
    </Pressable>
  );
}
