import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { title: string; onBack?: () => void };

export function Header({ title, onBack }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`min-h-14 flex-row items-center px-1.5 border-b border-line`}>
      {onBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={tw`w-11 h-11 items-center justify-center`}
        >
          <AppText variant="heading" tone="muted">
            ‹
          </AppText>
        </Pressable>
      )}
      <AppText variant="title" style={tw.style('px-1.5', !onBack && 'pl-3.5')}>
        {title}
      </AppText>
    </View>
  );
}
