import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

type Props = { name: string; detail: string; status: string | null; fallback: string; ago: string; nested?: boolean; onPress: () => void };

export function ProjectStatusRow({ name, detail, status, fallback, ago, nested, onPress }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: colors.raised }}
      style={tw.style('flex-row items-center gap-3 border-b border-line px-4', nested ? 'min-h-12 bg-card pl-8' : 'min-h-16')}
    >
      <View style={tw`w-24`}>
        {status ? (
          <StatusBadge status={status} />
        ) : (
          <AppText variant="caption" tone="muted">
            {fallback}
          </AppText>
        )}
      </View>
      <View style={tw`min-w-0 flex-1 gap-0.5`}>
        <AppText variant={nested ? 'small' : 'title'} tone={nested ? 'fg' : undefined} numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" mono tone="muted" numberOfLines={1} style={tw`text-[11px]`}>
          {detail}
        </AppText>
      </View>
      <AppText variant="caption" tone="muted">
        {ago}
      </AppText>
    </Pressable>
  );
}
