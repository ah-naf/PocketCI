import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

type Props = { id: string; title?: string; status: string; ago: string; duration: string; onPress?: () => void };

export function PipelineRow({ id, title, status, ago, duration, onPress }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: colors.raised }}
      style={tw`min-h-16 flex-row items-center gap-3 border-b border-line px-4`}
    >
      <View style={tw`w-24`}>
        <StatusBadge status={status} />
      </View>
      <View style={tw`min-w-0 flex-1 gap-0.5`}>
        <AppText mono style={tw`text-[15px] font-mono-medium`}>
          #{id}
        </AppText>
        {title ? (
          <AppText variant="caption" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={tw`items-end gap-0.5`}>
        <AppText variant="caption" tone="muted">
          {ago}
        </AppText>
        <AppText variant="caption" mono>
          {duration}
        </AppText>
      </View>
    </Pressable>
  );
}
