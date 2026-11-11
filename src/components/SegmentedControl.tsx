import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = { options: Option<T>[]; value: T; onChange: (id: T) => void };

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const { tw } = useTheme();
  return (
    <View style={tw`flex-row gap-1 rounded-xl border border-line bg-card p-1`}>
      {options.map(({ id, label }) => {
        const selected = id === value;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            style={tw.style('h-9 flex-1 items-center justify-center rounded-lg', selected && 'bg-primary')}
          >
            <AppText
              variant="small"
              tone={selected ? 'on-primary' : 'muted'}
              numberOfLines={1}
              style={tw`px-2 font-sans-semibold`}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
