import { Pressable, View } from 'react-native';
import { useTheme, type ColorName } from '../theme';
import { Icon, type IconName } from './Icon';
import { PulseDot } from './PulseDot';

type Props = { icon: IconName; label: string; onPress: () => void; color?: ColorName; filled?: boolean; pulsing?: boolean; active?: boolean };

export function IconButton({ icon, label, onPress, color, filled, pulsing, active }: Props) {
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
        <View style={tw`absolute right-2 top-2`}>
          <PulseDot color="accent" pulsing size={7} />
        </View>
      )}
    </Pressable>
  );
}
