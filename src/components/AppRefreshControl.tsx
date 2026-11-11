import { RefreshControl, type RefreshControlProps } from 'react-native';
import { useTheme } from '../theme';

export function AppRefreshControl(props: RefreshControlProps) {
  const { colors } = useTheme();
  return (
    <RefreshControl
      tintColor={colors.accent}
      colors={[colors.accent]}
      progressBackgroundColor={colors.card}
      {...props}
    />
  );
}
