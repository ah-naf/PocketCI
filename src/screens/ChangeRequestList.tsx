import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { ChangeRequestRow } from '../components/ChangeRequestRow';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { LoadingRow } from '../components/LoadingRow';
import { usePaginated } from '../hooks/usePaginated';
import { useProvider } from '../providers/ProviderContext';
import type { ProjectRef } from '../providers/types';
import { formatRelativeTime } from '../utils/format';

type Props = { project: ProjectRef; onOpen: (id: string) => void };

export function ChangeRequestList({ project, onOpen }: Props) {
  const provider = useProvider();
  const fetchPage = useCallback((page: number) => provider.listChangeRequests(project, page), [provider, project]);
  const requests = usePaginated(fetchPage);
  const noun = provider.labels.changeRequests;

  return (
    <FlatList
      data={requests.items}
      keyExtractor={(item) => item.id}
      onEndReached={requests.loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={<AppRefreshControl refreshing={requests.busy === 'refresh'} onRefresh={requests.refresh} />}
      renderItem={({ item }) => (
        <ChangeRequestRow
          id={item.id}
          title={item.title}
          author={item.author}
          authorAvatar={item.authorAvatar}
          sourceBranch={item.sourceBranch}
          targetBranch={item.targetBranch}
          draft={item.draft}
          ago={formatRelativeTime(item.updatedAt)}
          onPress={() => onOpen(item.id)}
        />
      )}
      ListEmptyComponent={
        requests.busy === 'initial' ? (
          <LoadingRow label={`Loading ${noun.toLowerCase()}`} />
        ) : requests.error != null ? undefined : (
          <EmptyState title={`No open ${noun.toLowerCase()}`} hint={`Open ${noun.toLowerCase()} for this ${provider.labels.project} show up here.`} />
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
