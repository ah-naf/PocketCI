import { View } from 'react-native';
import { useTheme } from '../theme';
import { getStatusStyle } from '../theme/status';
import { AppText } from './AppText';

export function StatusBadge({ status }: { status: string }) {
  const { tw } = useTheme();
  const { color, label, textColor } = getStatusStyle(status);
  return (
    <View
      style={tw`h-6 flex-row items-center gap-1.5 self-start rounded-full border border-${color}/35 bg-${color}/15 pl-2 pr-2.5`}
    >
      <View style={tw`h-2 w-2 rounded-full bg-${color}`} />
      <AppText variant="caption" tone={textColor ?? color} style={tw`font-sans-semibold`}>
        {label}
      </AppText>
    </View>
  );
}
