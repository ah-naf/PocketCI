import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { FieldLabel } from './FieldLabel';

type Props = {
  label: string;
  hint?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  isOptionDisabled?: (option: string) => string | undefined;
};

export function PickerField({ label, hint, value, options, onChange, isOptionDisabled }: Props) {
  const { tw } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={tw`gap-1.5`}>
      <FieldLabel label={label} hint={hint} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${hint ?? label}, ${value}`}
        onPress={() => setOpen(true)}
        style={tw`h-12 flex-row items-center justify-between rounded-xl border border-line bg-card px-3`}
      >
        <AppText mono numberOfLines={1} style={tw`flex-1 text-[13px]`}>
          {value}
        </AppText>
        <AppText variant="small" tone="dim">
          ▾
        </AppText>
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <AppText variant="heading">{label}</AppText>
        <ScrollView style={tw`max-h-80`}>
          {options.map((option) => {
            const reason = isOptionDisabled?.(option);
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ disabled: reason !== undefined }}
                disabled={reason !== undefined}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                style={tw.style(
                  'min-h-12 flex-row items-center justify-between gap-3 border-b border-line py-2',
                  reason !== undefined && 'opacity-50',
                )}
              >
                <View style={tw`min-w-0 flex-1`}>
                  <AppText mono tone={option === value ? 'accent' : 'fg'} style={tw`text-[13px]`}>
                    {option}
                  </AppText>
                  {reason !== undefined && <AppText variant="caption">{reason}</AppText>}
                </View>
                {option === value && <AppText tone="accent">✓</AppText>}
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
