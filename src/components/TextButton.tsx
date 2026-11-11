import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { label: string; onPress: () => void; danger?: boolean };

export function TextButton({ label, onPress, danger }: Props) {
  const { tw } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={tw`h-11 justify-center px-3`}>
      <AppText variant="small" tone={danger ? 'failed' : 'accent'} style={tw`font-sans-semibold`}>
        {label}
      </AppText>
    </Pressable>
  );
}
