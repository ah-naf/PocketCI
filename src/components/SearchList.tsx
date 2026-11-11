import type { ReactElement } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { describeError } from '../api/errors';
import type { Busy } from '../hooks/usePaginated';
import { useTheme } from '../theme';
import { EmptyState } from './EmptyState';
import { ErrorView } from './ErrorView';
import { Input } from './Input';
import { LoadingRow } from './LoadingRow';

type Props<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactElement;
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
  const { tw, colors } = useTheme();
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
        refreshControl={
          <RefreshControl
            refreshing={busy === 'refresh'}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.card}
          />
        }
        renderItem={({ item }) => renderItem(item)}
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
