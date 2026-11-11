import { View } from 'react-native';
import { useTheme } from '../theme';
import { getStatusStyle } from '../theme/status';
import { AppText } from './AppText';
import { PulseDot } from './PulseDot';

type Props = { status: string; large?: boolean };

export function StatusBadge({ status, large }: Props) {
  const { tw } = useTheme();
  const { color, label, textColor } = getStatusStyle(status);
  return (
    <View
      style={tw.style(
        'flex-row items-center self-start rounded-full border',
        `border-${color}/35 bg-${color}/15`,
        large ? 'h-8 gap-2 pl-2.5 pr-3' : 'h-6 gap-1.5 pl-2 pr-2.5',
      )}
    >
      <PulseDot color={color} pulsing={status === 'running'} />
      <AppText
        variant={large ? 'small' : 'caption'}
        tone={textColor ?? color}
        style={tw`font-sans-semibold ${large ? 'text-sm' : ''}`}
      >
        {label}
      </AppText>
    </View>
  );
}
