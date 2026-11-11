import { View } from 'react-native';
import type { LogNavigationMode } from '../hooks/useLogNavigation';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { Input } from './Input';

type Props = {
  query: string;
  onChangeQuery: (text: string) => void;
  mode: LogNavigationMode;
  position: number;
  count: number;
  errorCount: number;
  truncated: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onJumpToError: () => void;
};

function describe({ query, mode, position, count, errorCount }: Props) {
  if (mode === 'error') return count === 0 ? 'No errors in this log' : `Error ${position} of ${count}`;
  if (query.trim() === '') return errorCount === 0 ? 'Type to search this log' : `Type to search. ${errorCount} error lines found.`;
  return count === 0 ? 'No matches' : `Match ${position} of ${count}`;
}

export function LogSearchBar(props: Props) {
  const { tw } = useTheme();
  const { query, onChangeQuery, errorCount, truncated, onPrevious, onNext, onJumpToError } = props;
  return (
    <View style={tw`gap-1 border-b border-line bg-card px-4 pb-2 pt-3`}>
      <View style={tw`flex-row items-center gap-1`}>
        <View style={tw`flex-1`}>
          <Input
            accessibilityLabel="Search this log"
            placeholder="Search this log"
            value={query}
            onChangeText={onChangeQuery}
            returnKeyType="search"
            autoFocus
          />
        </View>
        <IconButton icon="chevronUp" label="Previous" onPress={onPrevious} />
        <IconButton icon="chevronDown" label="Next" onPress={onNext} />
        <IconButton
          icon="warning"
          label="Jump to next error"
          onPress={onJumpToError}
          color={errorCount > 0 ? 'failed' : 'dim'}
        />
      </View>
      <AppText variant="caption">
        {describe(props)}
        {truncated ? '. Only the last 2000 lines are searched, load the full log to search everything.' : ''}
      </AppText>
    </View>
  );
}
