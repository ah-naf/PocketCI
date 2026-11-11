import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { useAutoScroll } from '../hooks/useAutoScroll';
import { terminal, useTheme } from '../theme';
import type { LogKind, LogLine } from '../utils/log';

type Props = {
  lines: LogLine[];
  scroll: ReturnType<typeof useAutoScroll>;
  highlighted?: Set<number>;
  focusLine?: number;
};

const CHAR_WIDTH = 7;
const SCROLL_MARGIN = 80;

const textColors: Record<LogKind, string> = {
  plain: terminal.text,
  command: terminal.accent,
  warning: terminal.warning,
  success: terminal.success,
  error: terminal.error,
};

function rowBackground(line: LogLine, highlighted?: Set<number>, focusLine?: number) {
  if (line.number === focusLine) return terminal.currentMatchBackground;
  if (highlighted?.has(line.number)) return terminal.matchBackground;
  return line.kind === 'error' ? terminal.errorBackground : undefined;
}

export function LogView({ lines, scroll, highlighted, focusLine }: Props) {
  const { tw } = useTheme();
  const offsets = useRef<Record<number, number>>({});
  const gutterWidth = String(lines[lines.length - 1]?.number ?? 0).length * CHAR_WIDTH;

  useEffect(() => {
    if (focusLine === undefined) return;
    const y = offsets.current[focusLine];
    if (y !== undefined) scroll.ref.current?.scrollTo({ y: Math.max(0, y - SCROLL_MARGIN), animated: true });
  }, [focusLine, scroll.ref]);

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
          onLayout={(event) => {
            offsets.current[line.number] = event.nativeEvent.layout.y;
          }}
          style={[tw`flex-row gap-2.5 px-3`, { backgroundColor: rowBackground(line, highlighted, focusLine) }]}
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
