import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { FieldLabel } from './FieldLabel';

type Props = TextInputProps & {
  label?: string;
  labelHint?: string;
  error?: string;
  invalid?: boolean;
  secure?: boolean;
  mono?: boolean;
};

export function Input({ label, labelHint, error, invalid, secure, mono = true, style, ...rest }: Props) {
  const { tw, colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secure));
  const borderColor = error || invalid ? 'border-failed' : focused ? 'border-accent' : 'border-line';

  return (
    <View style={tw`gap-1.5`}>
      {label && <FieldLabel label={label} hint={labelHint} />}
      <View>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
          placeholderTextColor={colors.dim}
          {...rest}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            tw.style(
              'h-12 rounded-xl border bg-card px-3 text-[13px] text-fg',
              mono ? 'font-mono' : 'font-sans',
              borderColor,
              secure && 'pr-16',
            ),
            style,
          ]}
        />
        {secure && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show token' : 'Hide token'}
            onPress={() => setHidden(!hidden)}
            style={tw`absolute right-0.5 top-0.5 h-11 justify-center px-3`}
          >
            <AppText variant="small" tone="accent" style={tw`font-sans-semibold`}>
              {hidden ? 'Show' : 'Hide'}
            </AppText>
          </Pressable>
        )}
      </View>
      {error && (
        <AppText variant="caption" tone="failed">
          {error}
        </AppText>
      )}
    </View>
  );
}
