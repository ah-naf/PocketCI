import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme';
import { getStatusStyle } from '../theme/status';
import { AppText } from './AppText';

export function JobStatusIcon({ status }: { status: string }) {
  const { tw, colors } = useTheme();
  const { color, label, glyph } = getStatusStyle(status);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={tw`h-6 w-6 items-center justify-center rounded-full border border-${color}/40 bg-${color}/15`}
    >
      {glyph ? (
        <AppText variant="caption" tone={color} style={tw`font-sans-semibold`}>
          {glyph}
        </AppText>
      ) : (
        <ActivityIndicator size={12} color={colors[color]} />
      )}
    </View>
  );
}
