import { ScrollView, Text, View } from 'react-native';
import type { useAutoScroll } from '../hooks/useAutoScroll';
import { terminal, useTheme } from '../theme';
import type { LogKind, LogLine } from '../utils/log';

type Props = { lines: LogLine[]; scroll: ReturnType<typeof useAutoScroll> };

const lineStyles = {
  plain: { color: terminal.text },
  command: { color: terminal.accent },
  warning: { color: terminal.warning },
  success: { color: terminal.success },
  error: { color: terminal.error, backgroundColor: terminal.errorBackground },
} satisfies Record<LogKind, object>;

export function LogView({ lines, scroll }: Props) {
  const { tw } = useTheme();
  const gutterWidth = String(lines[lines.length - 1]?.number ?? 0).length;

  return (
    <ScrollView
      ref={scroll.ref}
      onScroll={scroll.onScroll}
      onContentSizeChange={scroll.onContentSizeChange}
      scrollEventThrottle={100}
      style={tw`flex-1 bg-term`}
      contentContainerStyle={tw`px-2 py-2.5`}
    >
      <Text selectable style={tw`font-mono text-[11.5px] leading-[19px]`}>
        {lines.map((line) => (
          <Text key={line.number} style={lineStyles[line.kind]}>
            <Text style={{ color: terminal.gutter }}>{String(line.number).padStart(gutterWidth)}  </Text>
            {line.text}
            {'\n'}
          </Text>
        ))}
      </Text>
      <View style={tw`h-2`} />
    </ScrollView>
  );
}
