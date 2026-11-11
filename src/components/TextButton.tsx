import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { label: string; onPress: () => void };

export function TextButton({ label, onPress }: Props) {
  const { tw } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={tw`h-11 justify-center px-3`}>
      <AppText variant="small" tone="accent" style={tw`font-sans-semibold`}>
        {label}
      </AppText>
    </Pressable>
  );
}
