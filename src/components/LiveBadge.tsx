import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { PulseDot } from './PulseDot';

export function LiveBadge() {
  const { tw } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="Live"
      style={tw`h-6 flex-row items-center gap-1.5 rounded-md border border-line px-2`}
    >
      <PulseDot color="accent" pulsing />
      <AppText variant="caption" mono tone="accent" style={tw`text-[11px] font-mono-medium tracking-widest`}>
        LIVE
      </AppText>
    </View>
  );
}
