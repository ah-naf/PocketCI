import { Pressable } from 'react-native';
import type { ProviderId } from '../providers/types';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { ProviderLogo } from './ProviderLogo';

type Props = { providerId: ProviderId; label: string; onPress: () => void };

export function ProviderPill({ providerId, label, onPress }: Props) {
  const { tw } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Switch provider"
      onPress={onPress}
      style={tw`h-9 flex-row items-center gap-2 rounded-full border border-line pl-2.5 pr-3`}
    >
      <ProviderLogo id={providerId} size={16} />
      <AppText variant="small" tone="accent" style={tw`font-sans-semibold`}>
        {label}
      </AppText>
      <Icon name="chevronDown" color="accent" size={16} />
    </Pressable>
  );
}
