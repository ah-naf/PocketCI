import Svg, { Circle, Path, Rect } from 'react-native-svg';
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
  back: <Path d="M15 5l-7 7 7 7" />,
  chevronRight: <Path d="M9 5l7 7-7 7" />,
  chevronDown: <Path d="M6 9l6 6 6-6" />,
  chevronUp: <Path d="M6 15l6-6 6 6" />,
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  warning: <Path d="M12 3l10 18H2L12 3zM12 10v5M12 18v.5" />,
  info: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  dots: <Path d="M6 12h.5M12 12h.5M18 12h.5" />,
  minus: <Path d="M6 12h12" />,
  plus: <Path d="M12 6v12M6 12h12" />,
  play: <Path d="M9 6l10 6-10 6z" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="6" />
      <Path d="M20 20l-4.5-4.5" />
    </>
  ),
  copy: (
    <>
      <Rect x="8" y="8" width="12" height="12" rx="2" />
      <Path d="M16 8V4H4v12h4" />
    </>
  ),
  arrowDown: <Path d="M12 4v12M6 11l6 6 6-6M5 20h14" />,
  eye: (
    <>
      <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <Circle cx="12" cy="12" r="3" />
    </>
  ),
  pulse: <Path d="M3 12h4l3-8 4 16 3-8h4" />,
  refresh: <Path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" />,
};

export type IconName = keyof typeof icons;

type Props = { name: IconName; color?: ColorName; size?: number; strokeWidth?: number; filled?: boolean };

export function Icon({ name, color = 'muted', size = 20, strokeWidth = 1.75, filled }: Props) {
  const { colors } = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? colors[color] : 'none'}
      stroke={colors[color]}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </Svg>
  );
}
