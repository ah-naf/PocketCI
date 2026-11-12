import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  note: string;
  warn?: boolean;
  onChange: (value: number) => void;
};

export function Stepper({ label, value, unit, min, max, step = 1, note, warn, onChange }: Props) {
  const { tw } = useTheme();
  return (
    <View style={tw`gap-1.5 rounded-2xl border border-line bg-card p-3`}>
      <View style={tw`flex-row items-center gap-2`}>
        <AppText variant="title" style={tw`min-w-0 flex-1 text-[15px]`}>
          {label}
        </AppText>
        <IconButton icon="minus" label={`Decrease ${label}`} onPress={() => onChange(Math.max(min, value - step))} />
        <AppText mono style={tw`min-w-12 text-center font-mono-medium`}>
          {value}
          {unit}
        </AppText>
        <IconButton icon="plus" label={`Increase ${label}`} onPress={() => onChange(Math.min(max, value + step))} />
      </View>
      <AppText variant="caption" tone={warn ? 'manual' : 'dim'}>
        {note}
      </AppText>
    </View>
  );
}
