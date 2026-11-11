import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { title: string; subtitle?: string; onBack?: () => void };

export function Header({ title, subtitle, onBack }: Props) {
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
      <View style={tw.style('min-w-0 flex-1 px-1.5 py-2', !onBack && 'pl-3.5')}>
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="small" mono numberOfLines={1} style={tw`text-xs leading-4`}>
            {subtitle}
          </AppText>
        )}
      </View>
    </View>
  );
}
