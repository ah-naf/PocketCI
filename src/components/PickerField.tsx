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
};

export function PickerField({ label, hint, value, options, onChange }: Props) {
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
        <AppText mono style={tw`text-[13px]`}>
          {value}
        </AppText>
        <AppText variant="small" tone="dim">
          ▾
        </AppText>
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <AppText variant="heading">{label}</AppText>
        <ScrollView style={tw`max-h-80`}>
          {options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={tw`h-12 flex-row items-center justify-between border-b border-line`}
            >
              <AppText mono tone={option === value ? 'accent' : 'fg'} style={tw`text-[13px]`}>
                {option}
              </AppText>
              {option === value && <AppText tone="accent">✓</AppText>}
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
