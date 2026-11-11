import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export function LoadingRow({ label }: { label: string }) {
  const { tw, colors } = useTheme();
  return (
    <View accessibilityRole="progressbar" style={tw`h-14 flex-row items-center justify-center gap-2`}>
      <ActivityIndicator size="small" color={colors.accent} />
      <AppText variant="caption" mono>
        {label}
      </AppText>
    </View>
  );
}
