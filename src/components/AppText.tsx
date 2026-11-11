import { Text, type TextProps } from 'react-native';
import { useTheme, type ColorName } from '../theme';

const variants = {
  display: 'text-[28px] leading-8 font-sans-semibold tracking-tight text-fg',
  heading: 'text-[22px] leading-7 font-sans-semibold text-fg',
  title: 'text-base leading-[22px] font-sans-semibold text-fg',
  body: 'text-[15px] leading-[22px] font-sans text-fg',
  small: 'text-[13px] leading-[18px] font-sans text-muted',
  caption: 'text-xs leading-4 font-sans text-dim',
  label: 'text-[11px] leading-4 font-sans-semibold uppercase tracking-widest text-dim',
};

type Props = TextProps & {
  variant?: keyof typeof variants;
  mono?: boolean;
  tone?: ColorName;
};

export function AppText({ variant = 'body', mono, tone, style, ...rest }: Props) {
  const { tw } = useTheme();
  return (
    <Text
      {...rest}
      style={[tw.style(variants[variant], mono && 'font-mono', tone && `text-${tone}`), style]}
    />
  );
}
