import { useMemo } from 'react';
import MarkdownDisplay from 'react-native-markdown-display';
import { useTheme } from '../theme';

type Props = { children: string; fontSize?: number };

const HTML_COMMENT = /<!--[\s\S]*?-->/g;

export function Markdown({ children, fontSize = 15 }: Props) {
  const { colors } = useTheme();

  const styles = useMemo(
    () => ({
      body: { color: colors.fg, fontFamily: 'InterTight_400Regular', fontSize, lineHeight: Math.round(fontSize * 1.45) },
      heading1: { fontFamily: 'InterTight_600SemiBold', fontSize: fontSize + 7, marginTop: 12, marginBottom: 6 },
      heading2: { fontFamily: 'InterTight_600SemiBold', fontSize: fontSize + 4, marginTop: 10, marginBottom: 6 },
      heading3: { fontFamily: 'InterTight_600SemiBold', fontSize: fontSize + 2, marginTop: 8, marginBottom: 4 },
      heading4: { fontFamily: 'InterTight_600SemiBold', fontSize, marginTop: 8, marginBottom: 4 },
      strong: { fontFamily: 'InterTight_600SemiBold' },
      link: { color: colors.accent, textDecorationLine: 'underline' as const },
      blockquote: {
        backgroundColor: colors.raised,
        borderLeftColor: colors.line,
        borderLeftWidth: 3,
        marginLeft: 0,
        paddingHorizontal: 10,
      },
      code_inline: {
        backgroundColor: colors.raised,
        color: colors.fg,
        fontFamily: 'JetBrainsMono_400Regular',
        fontSize: fontSize - 2,
      },
      code_block: {
        backgroundColor: colors.term,
        borderColor: colors.line,
        color: '#D5DBE0',
        fontFamily: 'JetBrainsMono_400Regular',
        fontSize: fontSize - 3,
        padding: 10,
      },
      fence: {
        backgroundColor: colors.term,
        borderColor: colors.line,
        color: '#D5DBE0',
        fontFamily: 'JetBrainsMono_400Regular',
        fontSize: fontSize - 3,
        padding: 10,
      },
      hr: { backgroundColor: colors.line },
      table: { borderColor: colors.line },
      tr: { borderColor: colors.line },
      th: { fontFamily: 'InterTight_600SemiBold' },
    }),
    [colors, fontSize],
  );

  return <MarkdownDisplay style={styles}>{children.replace(HTML_COMMENT, '').trim()}</MarkdownDisplay>;
}
