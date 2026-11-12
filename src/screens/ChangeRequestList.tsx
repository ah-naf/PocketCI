import { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { ChangeRequestRow } from '../components/ChangeRequestRow';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { FilterChips } from '../components/FilterChips';
import { LoadingRow } from '../components/LoadingRow';
import { usePaginated } from '../hooks/usePaginated';
import { useProvider } from '../providers/ProviderContext';
import type { ChangeRequestFilter, ProjectRef } from '../providers/types';
import { CHANGE_REQUEST_FILTERS } from '../utils/changeRequestStatus';
import { formatRelativeTime } from '../utils/format';

type Props = { project: ProjectRef; onOpen: (id: string) => void };

export function ChangeRequestList({ project, onOpen }: Props) {
  const provider = useProvider();
  const [filter, setFilter] = useState<ChangeRequestFilter>('open');
  const fetchPage = useCallback(
    (page: number) => provider.listChangeRequests(project, filter, page),
    [provider, project, filter],
  );
  const requests = usePaginated(fetchPage);
  const noun = provider.labels.changeRequests;

  return (
    <FlatList
      data={requests.items}
      keyExtractor={(item) => item.id}
      onEndReached={requests.loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={<AppRefreshControl refreshing={requests.busy === 'refresh'} onRefresh={requests.refresh} />}
      ListHeaderComponent={
        <FilterChips options={CHANGE_REQUEST_FILTERS} value={filter} onChange={(id) => setFilter(id as ChangeRequestFilter)} />
      }
      renderItem={({ item }) => (
        <ChangeRequestRow
          id={item.id}
          title={item.title}
          author={item.author}
          authorAvatar={item.authorAvatar}
          sourceBranch={item.sourceBranch}
          targetBranch={item.targetBranch}
          state={item.state}
          draft={item.draft}
          ago={formatRelativeTime(item.updatedAt)}
          onPress={() => onOpen(item.id)}
        />
      )}
      ListEmptyComponent={
        requests.busy === 'initial' ? (
          <LoadingRow label={`Loading ${noun.toLowerCase()}`} />
        ) : requests.error != null ? undefined : (
          <EmptyState
            title={filter === 'all' ? `No ${noun.toLowerCase()}` : `No ${filter} ${noun.toLowerCase()}`}
            hint={`${noun} for this ${provider.labels.project} show up here.`}
          />
        )
      }
      ListFooterComponent={
        requests.busy === 'more' ? (
          <LoadingRow label="Loading more" />
        ) : requests.error != null ? (
          <ErrorView error={requests.error} onRetry={requests.refresh} />
        ) : undefined
      }
    />
  );
}
