import { Pressable, View } from 'react-native';
import { useTheme, type ColorName } from '../theme';
import { Icon, type IconName } from './Icon';
import { PulseDot } from './PulseDot';

type Props = { icon: IconName; label: string; onPress: () => void; color?: ColorName; filled?: boolean; pulsing?: boolean };

export function IconButton({ icon, label, onPress, color, filled, pulsing }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: colors.raised, borderless: true, radius: 22 }}
      style={tw`h-11 w-11 items-center justify-center`}
    >
      <Icon name={icon} color={pulsing ? 'accent' : color} filled={filled} />
      {pulsing && (
        <View style={tw`absolute right-2.5 top-2.5`}>
          <PulseDot color="accent" pulsing size={7} />
        </View>
      )}
    </Pressable>
  );
}
