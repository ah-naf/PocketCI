import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme';
import { getStatusStyle } from '../theme/status';
import { Icon } from './Icon';

export function JobStatusIcon({ status }: { status: string }) {
  const { tw, colors } = useTheme();
  const { color, label, icon } = getStatusStyle(status);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={tw`h-6 w-6 items-center justify-center rounded-full border border-${color}/40 bg-${color}/15`}
    >
      {icon ? (
        <Icon name={icon} color={color} size={13} strokeWidth={2.4} />
      ) : (
        <ActivityIndicator size={12} color={colors[color]} />
      )}
    </View>
  );
}
