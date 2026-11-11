import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

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
      <Icon name={expanded ? 'chevronDown' : 'chevronRight'} color="accent" size={16} />
      <AppText variant="title" numberOfLines={1} style={tw`flex-1 text-sm`}>
        {title}
      </AppText>
      <AppText variant="caption" mono style={tw`text-[11px]`}>
        {count}
      </AppText>
    </Pressable>
  );
}
