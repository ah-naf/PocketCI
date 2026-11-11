import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { title: string; count: number; expanded: boolean; onPress?: () => void };

export function GroupHeader({ title, count, expanded, onPress }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${count} items`}
      accessibilityState={{ expanded }}
      onPress={onPress}
      android_ripple={{ color: colors.raised }}
      style={tw`h-12 flex-row items-center gap-2 border-b border-line bg-card px-4`}
    >
      <AppText variant="caption" tone="accent" style={tw`w-3 text-[10px]`}>
        {expanded ? '▼' : '▶'}
      </AppText>
      <AppText variant="title" numberOfLines={1} style={tw`flex-1 text-sm`}>
        {title}
      </AppText>
      <AppText variant="caption" mono style={tw`text-[11px]`}>
        {count}
      </AppText>
    </Pressable>
  );
}
