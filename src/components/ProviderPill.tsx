import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

type Props = { label: string; onPress: () => void };

export function ProviderPill({ label, onPress }: Props) {
  const { tw } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Switch provider"
      onPress={onPress}
      style={tw`h-9 flex-row items-center gap-1.5 rounded-full border border-line px-3`}
    >
      <AppText variant="small" tone="accent" style={tw`font-sans-semibold`}>
        {label}
      </AppText>
      <Icon name="chevronDown" color="accent" size={16} />
    </Pressable>
  );
}
