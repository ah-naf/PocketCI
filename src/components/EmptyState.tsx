import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = {
  title: string;
  hint: string;
  leading?: ReactNode;
  children?: ReactNode;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ title, hint, leading, children, action }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`gap-4 px-4 pt-14`}>
      {leading}
      <AppText variant="heading">{title}</AppText>
      <AppText variant="body" tone="muted">
        {hint}
      </AppText>
      {children}
      {action && (
        <Button variant="primary" label={action.label} onPress={action.onPress} style={tw`mt-2`} />
      )}
    </View>
  );
}
