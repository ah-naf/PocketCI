import { Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Option = { id: string; label: string; count?: number };

type Props = { options: Option[]; value: string; onChange: (id: string) => void };

export function FilterChips({ options, value, onChange }: Props) {
  const { tw } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={tw`gap-2 px-4 py-3`}
      style={tw`grow-0 border-b border-line`}
    >
      {options.map(({ id, label, count }) => {
        const selected = id === value;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            style={tw.style(
              'h-8 flex-row items-center gap-1.5 rounded-full border px-3',
              selected ? 'border-primary bg-primary' : 'border-line',
            )}
          >
            <AppText variant="caption" tone={selected ? 'on-primary' : 'muted'} style={tw`font-sans-semibold`}>
              {label}
            </AppText>
            {count !== undefined && (
              <AppText variant="caption" mono tone={selected ? 'on-primary' : 'dim'} style={tw`text-[11px]`}>
                {count}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
