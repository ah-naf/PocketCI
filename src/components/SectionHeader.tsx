import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { title: string; right?: string; bordered?: boolean };

export function SectionHeader({ title, right, bordered }: Props) {
  const { tw } = useTheme();
  return (
    <View
      style={tw.style(
        'flex-row items-center justify-between px-4 pb-2.5',
        bordered ? 'border-b border-line pt-7' : 'pt-5',
      )}
    >
      <AppText variant="label">{title}</AppText>
      {right && <AppText variant="label">{right}</AppText>}
    </View>
  );
}
