import { ScrollView, Text, View } from 'react-native';
import type { useAutoScroll } from '../hooks/useAutoScroll';
import { terminal, useTheme } from '../theme';
import type { LogKind, LogLine } from '../utils/log';

type Props = { lines: LogLine[]; scroll: ReturnType<typeof useAutoScroll> };

const CHAR_WIDTH = 7;

const textColors: Record<LogKind, string> = {
  plain: terminal.text,
  command: terminal.accent,
  warning: terminal.warning,
  success: terminal.success,
  error: terminal.error,
};

export function LogView({ lines, scroll }: Props) {
  const { tw } = useTheme();
  const gutterWidth = String(lines[lines.length - 1]?.number ?? 0).length * CHAR_WIDTH;

  return (
    <ScrollView
      ref={scroll.ref}
      onScroll={scroll.onScroll}
      onContentSizeChange={scroll.onContentSizeChange}
      scrollEventThrottle={100}
      style={tw`flex-1 bg-term`}
      contentContainerStyle={tw`py-2.5`}
    >
      {lines.map((line) => (
        <View
          key={line.number}
          style={[tw`flex-row gap-2.5 px-3`, line.kind === 'error' && { backgroundColor: terminal.errorBackground }]}
        >
          <Text style={[tw`font-mono text-[11px] leading-[19px] text-right`, { width: gutterWidth, color: terminal.gutter }]}>
            {line.number}
          </Text>
          <Text
            selectable
            style={[tw`flex-1 font-mono text-[11.5px] leading-[19px]`, { color: textColors[line.kind] }]}
          >
            {line.text || ' '}
          </Text>
        </View>
      ))}
      <View style={tw`h-2`} />
    </ScrollView>
  );
}
