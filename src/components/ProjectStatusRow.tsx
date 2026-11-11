import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

type Props = { name: string; detail: string; status: string | null; fallback: string; ago: string; onPress: () => void };

export function ProjectStatusRow({ name, detail, status, fallback, ago, onPress }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: colors.raised }}
      style={tw`min-h-16 flex-row items-center gap-3 border-b border-line px-4`}
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
        <AppText variant="title" numberOfLines={1}>
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
