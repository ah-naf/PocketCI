import { View } from 'react-native';
import type { ProviderId } from '../providers/types';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { ProviderPill } from './ProviderPill';

type Props = { providerId: ProviderId; providerName: string; onSwitchProvider: () => void };

export function SetupTopBar({ providerId, providerName, onSwitchProvider }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`h-14 flex-row items-center justify-between`}>
      <AppText variant="small" mono tone="fg">
        pocket
        <AppText variant="small" mono tone="accent">
          /
        </AppText>
        ci
      </AppText>
      <ProviderPill providerId={providerId} label={providerName} onPress={onSwitchProvider} />
    </View>
  );
}
