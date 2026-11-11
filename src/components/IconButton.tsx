import { Pressable } from 'react-native';
import { useTheme, type ColorName } from '../theme';
import { Icon, type IconName } from './Icon';

type Props = { icon: IconName; label: string; onPress: () => void; color?: ColorName };

export function IconButton({ icon, label, onPress, color }: Props) {
  const { tw, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: colors.raised, borderless: true, radius: 22 }}
      style={tw`h-11 w-11 items-center justify-center`}
    >
      <Icon name={icon} color={color} />
    </Pressable>
  );
}
