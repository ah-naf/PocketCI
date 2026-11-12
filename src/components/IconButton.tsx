import { Pressable, View } from 'react-native';
import { useTheme, type ColorName } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PulseDot } from './PulseDot';

type Props = { icon: IconName; label: string; onPress: () => void; color?: ColorName; filled?: boolean; pulsing?: boolean; active?: boolean; count?: number };

export function IconButton({ icon, label, onPress, color, filled, pulsing, active, count }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: colors.raised, borderless: true, radius: 22 }}
      style={tw`h-11 w-11 items-center justify-center`}
    >
      <View style={tw.style('h-9 w-9 items-center justify-center rounded-full', active && 'border border-accent/45 bg-accent/15')}>
        <Icon name={icon} color={pulsing ? 'accent' : color} filled={filled} />
      </View>
      {pulsing && (
        <View style={tw`absolute bottom-2 right-2`}>
          <PulseDot color="accent" pulsing size={7} />
        </View>
      )}
      {count !== undefined && count > 0 && (
        <View
          style={tw.style(
            'absolute right-0.5 top-0.5 h-4 min-w-4 items-center justify-center rounded-full border px-1',
            pulsing ? 'border-accent bg-accent' : 'border-line bg-raised',
          )}
        >
          <AppText mono tone={pulsing ? 'on-primary' : 'muted'} style={tw`text-[10px] leading-3 font-mono-medium`}>
            {count}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
