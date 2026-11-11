import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Row = { label: string; value?: string | null; mono?: boolean };

export function DetailsCard({ rows }: { rows: Row[] }) {
  const { tw } = useTheme();
  const visible = rows.filter((row) => row.value);
  if (visible.length === 0) return null;
  return (
    <View style={tw`overflow-hidden rounded-2xl border border-line bg-card`}>
      {visible.map((row, index) => (
        <View
          key={row.label}
          style={tw.style('flex-row gap-3 px-4 py-2.5', index < visible.length - 1 && 'border-b border-line')}
        >
          <AppText variant="caption" style={tw`w-24 pt-0.5`}>
            {row.label}
          </AppText>
          <AppText mono={row.mono} selectable style={tw`flex-1 text-[13px] leading-[19px]`}>
            {row.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}
