import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = {
  variant: 'success' | 'failed';
  title: string;
  message?: string;
  detail?: string;
};

export function Banner({ variant, title, message, detail }: Props) {
  const { tw } = useTheme();
  return (
    <View
      accessibilityRole={variant === 'failed' ? 'alert' : undefined}
      style={tw`flex-row gap-2.5 rounded-xl border border-${variant}/35 bg-${variant}/10 p-3`}
    >
      <AppText variant="title" tone={variant}>
        {variant === 'success' ? '✓' : '!'}
      </AppText>
      <View style={tw`flex-1 gap-0.5`}>
        <AppText variant="small" tone="fg" style={tw`font-sans-semibold`}>
          {title}
        </AppText>
        {message && <AppText variant="small">{message}</AppText>}
        {detail && (
          <AppText variant="caption" mono style={tw`mt-1`}>
            {detail}
          </AppText>
        )}
      </View>
    </View>
  );
}
