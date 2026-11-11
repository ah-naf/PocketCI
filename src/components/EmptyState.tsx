import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { title: string; hint: string };

export function EmptyState({ title, hint }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`gap-2 px-4 pt-14`}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="body" tone="muted">
        {hint}
      </AppText>
    </View>
  );
}
