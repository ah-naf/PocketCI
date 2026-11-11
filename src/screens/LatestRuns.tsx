import { useIsFocused } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { AppText } from '../components/AppText';
import { ErrorView } from '../components/ErrorView';
import { FilterChips } from '../components/FilterChips';
import { LoadingRow } from '../components/LoadingRow';
import { PipelineRow } from '../components/PipelineRow';
import { usePaginated } from '../hooks/usePaginated';
import { usePoll } from '../hooks/usePoll';
import { useProvider } from '../providers/ProviderContext';
import type { ProjectRef, RunFilter } from '../providers/types';
import { useTheme } from '../theme';
import { formatPipelineDuration, formatRelativeTime } from '../utils/format';
import { isPipelineActive, RUN_FILTERS } from '../utils/status';

type Props = { project: ProjectRef; onOpenRun: (runId: string) => void };

const POLL_INTERVAL_MS = 5000;

export function LatestRuns({ project, onOpenRun }: Props) {
  const { tw } = useTheme();
  const provider = useProvider();
  const focused = useIsFocused();
  const [filter, setFilter] = useState<RunFilter>('all');

  const fetchPage = useCallback(
    (page: number) => provider.listRuns(project, null, filter, page),
    [provider, project, filter],
  );
  const runs = usePaginated(fetchPage);
  const hasActiveRun = runs.items.some((item) => isPipelineActive(item.status));
  usePoll(runs.poll, POLL_INTERVAL_MS, focused && hasActiveRun);

  const filterLabel = RUN_FILTERS.find((option) => option.id === filter)?.label.toLowerCase();

  return (
    <FlatList
      data={runs.items}
      keyExtractor={(item) => item.id}
      onEndReached={runs.loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={<AppRefreshControl refreshing={runs.busy === 'refresh'} onRefresh={runs.refresh} />}
      ListHeaderComponent={
        <FilterChips options={RUN_FILTERS} value={filter} onChange={(id) => setFilter(id as RunFilter)} />
      }
      renderItem={({ item }) => (
        <PipelineRow
          id={item.id}
          title={item.title}
          branch={item.ref}
          status={item.status}
          ago={formatRelativeTime(item.createdAt)}
          duration={formatPipelineDuration(item.createdAt, item.updatedAt, item.status)}
          onPress={() => onOpenRun(item.id)}
        />
      )}
      ListEmptyComponent={
        runs.busy === 'initial' ? (
          <LoadingRow label={`Loading ${provider.labels.runs}`} />
        ) : runs.error != null ? undefined : (
          <AppText variant="small" style={tw`p-4`}>
            {filter === 'all'
              ? `No ${provider.labels.runs} in this ${provider.labels.project} yet.`
              : `No ${filterLabel} ${provider.labels.runs} in this ${provider.labels.project}.`}
          </AppText>
        )
      }
      ListFooterComponent={
        runs.busy === 'more' ? (
          <LoadingRow label="Loading more" />
        ) : runs.error != null ? (
          <ErrorView error={runs.error} onRetry={runs.refresh} />
        ) : undefined
      }
    />
  );
}
