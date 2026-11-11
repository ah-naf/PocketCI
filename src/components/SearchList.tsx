import type { ReactElement } from 'react';
import { FlatList, View } from 'react-native';
import { describeError } from '../api/errors';
import type { Busy } from '../hooks/usePaginated';
import { useTheme } from '../theme';
import { AppRefreshControl } from './AppRefreshControl';
import { EmptyState } from './EmptyState';
import { ErrorView } from './ErrorView';
import { Input } from './Input';
import { LoadingRow } from './LoadingRow';

type Props<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactElement;
  header?: ReactElement;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  busy: Busy;
  error: unknown;
  onRefresh: () => void;
  onEndReached: () => void;
  loadingLabel: string;
  emptyTitle: string;
  emptyHint: string;
};

export function SearchList<T>({
  data,
  keyExtractor,
  renderItem,
  header,
  search,
  onSearchChange,
  searchPlaceholder,
  busy,
  error,
  onRefresh,
  onEndReached,
  loadingLabel,
  emptyTitle,
  emptyHint,
}: Props<T>) {
  const { tw } = useTheme();
  return (
    <>
      <View style={tw`border-b border-line px-4 py-3`}>
        <Input
          accessibilityLabel={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={search}
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={<AppRefreshControl refreshing={busy === 'refresh'} onRefresh={onRefresh} />}
        renderItem={({ item }) => renderItem(item)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          busy === 'initial' ? (
            <LoadingRow label={loadingLabel} />
          ) : error ? undefined : (
            <EmptyState title={emptyTitle} hint={emptyHint} />
          )
        }
        ListFooterComponent={
          busy === 'more' ? (
            <LoadingRow label="Loading more" />
          ) : error ? (
            <ErrorView error={error} onRetry={onRefresh} />
          ) : undefined
        }
      />
    </>
  );
}
