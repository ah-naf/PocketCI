import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { label: string; hint?: string };

export function FieldLabel({ label, hint }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`flex-row items-baseline justify-between gap-2`}>
      <AppText variant="small" style={tw`shrink font-sans-medium`}>
        {label}
      </AppText>
      {hint && (
        <AppText variant="caption" mono style={tw`text-[11px]`}>
          {hint}
        </AppText>
      )}
    </View>
  );
}
