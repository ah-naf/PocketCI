import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = {
  title: string;
  hint: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ title, hint, action }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`flex-1 items-center justify-center gap-2 px-8`}>
      <AppText variant="heading" style={tw`text-center`}>
        {title}
      </AppText>
      <AppText variant="small" style={tw`text-center`}>
        {hint}
      </AppText>
      {action && <Button variant="primary" label={action.label} onPress={action.onPress} style={tw`mt-4 self-stretch`} />}
    </View>
  );
}
