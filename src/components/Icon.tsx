import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme, type ColorName } from '../theme';

const icons = {
  sun: (
    <>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  sliders: (
    <>
      <Path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <Circle cx="16" cy="7" r="2" />
      <Circle cx="8" cy="17" r="2" />
    </>
  ),
};

export type IconName = keyof typeof icons;

type Props = { name: IconName; color?: ColorName; size?: number };

export function Icon({ name, color = 'muted', size = 20 }: Props) {
  const { colors } = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors[color]}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </Svg>
  );
}
