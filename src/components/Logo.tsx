import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme';

type Props = { width?: number };

const VIEW_WIDTH = 650;
const VIEW_HEIGHT = 184;

export function Logo({ width = 120 }: Props) {
  const { colors } = useTheme();
  return (
    <Svg
      accessibilityLabel="PocketCI"
      width={width}
      height={(width * VIEW_HEIGHT) / VIEW_WIDTH}
      viewBox={`200 420 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
    >
      <Path d="M300 512H730" stroke={colors.accent} strokeWidth={30} />
      <Circle cx={270} cy={512} r={48} fill={colors.bg} stroke={colors.accent} strokeWidth={28} />
      <Circle cx={512} cy={512} r={48} fill={colors.bg} stroke={colors.accent} strokeWidth={28} />
      <Circle cx={755} cy={512} r={84} fill={colors.accent} />
      <Path
        d="M716 512l27 26 52-55"
        fill="none"
        stroke={colors.bg}
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
