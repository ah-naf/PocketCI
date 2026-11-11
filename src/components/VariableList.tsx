import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Props = { entries: { key: string; value: string }[] };

export function VariableList({ entries }: Props) {
  const { tw } = useTheme();
  if (entries.length === 0) {
    return (
      <AppText variant="caption" mono style={tw`p-3`}>
        No variables
      </AppText>
    );
  }
  return (
    <>
      {entries.map(({ key, value }, index) => (
        <View
          key={key}
          style={tw.style('gap-0.5 px-3 py-2.5', index < entries.length - 1 && 'border-b border-line')}
        >
          <AppText variant="caption" mono tone="muted" style={tw`text-[11px] tracking-wide`}>
            {key}
          </AppText>
          {value === '' ? (
            <AppText variant="caption" tone="dim" style={tw`text-[13px]`}>
              empty
            </AppText>
          ) : (
            <AppText mono tone="fg" selectable style={tw`text-[13px] leading-[19px]`}>
              {value}
            </AppText>
          )}
        </View>
      ))}
    </>
  );
}
