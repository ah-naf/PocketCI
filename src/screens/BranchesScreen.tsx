import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { fetchBranches, fetchProject } from '../api/projects';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { Input } from '../components/Input';
import { ListRow } from '../components/ListRow';
import { LoadingRow } from '../components/LoadingRow';
import { Screen } from '../components/Screen';
import { useDebounce } from '../hooks/useDebounce';
import { usePaginated } from '../hooks/usePaginated';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Branches'>;

type BranchRow = { name: string; isDefault: boolean };

export function BranchesScreen({ navigation, route }: Props) {
  const { projectId, projectName } = route.params;
  const { tw, colors } = useTheme();
  const [search, setSearch] = useState('');
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);
  const query = useDebounce(search.trim(), 300);

  useEffect(() => {
    fetchProject(projectId).then(
      (project) => setDefaultBranch(project.default_branch),
      () => setDefaultBranch(null),
    );
  }, [projectId]);

  const fetchPage = useCallback(
    (page: number) => fetchBranches(projectId, query, page),
    [projectId, query],
  );
  const { items, busy, error, refresh, loadMore } = usePaginated(fetchPage);

  const showPinned = defaultBranch !== null && defaultBranch.toLowerCase().includes(query.toLowerCase());
  const rows: BranchRow[] = [
    ...(showPinned ? [{ name: defaultBranch, isDefault: true }] : []),
    ...items.filter((branch) => branch.name !== defaultBranch).map(({ name }) => ({ name, isDefault: false })),
  ];

  return (
    <Screen title="Branches" subtitle={projectName} onBack={navigation.goBack}>
      <View style={tw`border-b border-line px-4 py-3`}>
        <Input
          accessibilityLabel="Search branches"
          placeholder="Search branches"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.name}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={busy === 'refresh'}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.card}
          />
        }
        renderItem={({ item }) => (
          <ListRow
            title={item.name}
            monoTitle
            tag={item.isDefault ? 'default' : undefined}
            accentTag
            onPress={() => navigation.navigate('Branch', { projectId, projectName, branch: item.name })}
          />
        )}
        ListEmptyComponent={
          busy === 'initial' ? (
            <LoadingRow label="Loading branches" />
          ) : error ? undefined : (
            <EmptyState title="No branches found" hint="Try a different search." />
          )
        }
        ListFooterComponent={
          busy === 'more' ? (
            <LoadingRow label="Loading more" />
          ) : error ? (
            <ErrorView error={error} onRetry={refresh} />
          ) : undefined
        }
      />
    </Screen>
  );
}
