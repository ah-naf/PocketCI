import { useMemo, useState, type ReactElement } from 'react';
import { SectionList, View } from 'react-native';
import type { Busy } from '../hooks/usePaginated';
import { useTheme } from '../theme';
import { AppRefreshControl } from './AppRefreshControl';
import { EmptyState } from './EmptyState';
import { ErrorView } from './ErrorView';
import { Input } from './Input';
import { LoadingRow } from './LoadingRow';
import { GroupHeader } from './GroupHeader';

type Section<T> = { title: string; count: number; data: T[] };

function buildSections<T>(data: T[], groupBy?: (item: T) => string): Section<T>[] {
  if (!groupBy) return [{ title: '', count: data.length, data }];
  const groups = new Map<string, T[]>();
  for (const item of data) {
    const title = groupBy(item);
    groups.set(title, [...(groups.get(title) ?? []), item]);
  }
  return [...groups].map(([title, items]) => ({ title, count: items.length, data: items }));
}

type Props<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactElement;
  header?: ReactElement;
  groupBy?: (item: T) => string;
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
  groupBy,
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const sections = useMemo(() => buildSections(data, groupBy), [data, groupBy]);
  const grouped = sections.length > 1;
  const searching = search.trim() !== '';
  const isExpanded = (title: string) => !grouped || searching || expandedGroups.has(title);
  const visibleSections = sections.map((section) => ({
    ...section,
    data: isExpanded(section.title) ? section.data : [],
  }));

  function toggleGroup(title: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (!next.delete(title)) next.add(title);
      return next;
    });
  }
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
      <SectionList
        sections={visibleSections}
        keyExtractor={keyExtractor}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) =>
          grouped ? (
            <GroupHeader
              title={section.title}
              count={section.count}
              expanded={isExpanded(section.title)}
              onPress={searching ? undefined : () => toggleGroup(section.title)}
            />
          ) : null
        }
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
