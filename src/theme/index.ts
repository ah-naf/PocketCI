import { useColorScheme } from 'react-native';
import { create } from 'twrnc';

const palettes = {
  dark: {
    bg: '#0B0E11',
    card: '#12161B',
    raised: '#1B2128',
    line: '#232B33',
    fg: '#E8ECEF',
    muted: '#9AA6B2',
    dim: '#7F8B97',
    accent: '#C6F432',
    primary: '#C6F432',
    'on-primary': '#0B0E11',
    success: '#3FCF8E',
    failed: '#F0616D',
    'on-failed': '#0B0E11',
    running: '#4FA3FF',
    pending: '#9AA6B2',
    canceled: '#5C6772',
    manual: '#F5A43C',
    term: '#07090B',
    scrim: '#0000009E',
  },
  light: {
    bg: '#F5F6F3',
    card: '#FFFFFF',
    raised: '#ECEEE9',
    line: '#DFE2DB',
    fg: '#14181C',
    muted: '#4E5861',
    dim: '#636D76',
    accent: '#567800',
    primary: '#14181C',
    'on-primary': '#C6F432',
    success: '#137544',
    failed: '#BD2A37',
    'on-failed': '#FFFFFF',
    running: '#1565C8',
    pending: '#636D76',
    canceled: '#9AA3AB',
    manual: '#A45600',
    term: '#14181C',
    scrim: '#14181C73',
  },
};

const fontFamily = {
  sans: 'InterTight_400Regular',
  'sans-medium': 'InterTight_500Medium',
  'sans-semibold': 'InterTight_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  'mono-medium': 'JetBrainsMono_500Medium',
};

const themes = {
  dark: create({ theme: { extend: { colors: palettes.dark, fontFamily } } }),
  light: create({ theme: { extend: { colors: palettes.light, fontFamily } } }),
};

export type ColorName = keyof typeof palettes.dark;

export function useTheme() {
  const scheme = useColorScheme() === 'light' ? 'light' : 'dark';
  return { tw: themes[scheme], colors: palettes[scheme], scheme };
}

export const terminal = {
  text: '#D5DBE0',
  gutter: '#5C6772',
  accent: '#C6F432',
  warning: '#F5A43C',
  success: '#3FCF8E',
  error: '#FF9AA2',
  errorBackground: '#F0616D29',
  matchBackground: '#C6F43224',
  currentMatchBackground: '#C6F4325C',
};
