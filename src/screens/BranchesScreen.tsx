import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { fetchBranches, fetchProject } from '../api/projects';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SearchList } from '../components/SearchList';
import { useSearchPage } from '../hooks/useSearchPage';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Branches'>;

type BranchRow = { name: string; isDefault: boolean };

export function BranchesScreen({ navigation, route }: Props) {
  const { projectId, projectName } = route.params;
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);

  useEffect(() => {
    fetchProject(projectId).then(
      (project) => setDefaultBranch(project.default_branch),
      () => setDefaultBranch(null),
    );
  }, [projectId]);

  const fetchWithQuery = useCallback(
    (query: string, page: number) => fetchBranches(projectId, query, page),
    [projectId],
  );
  const { search, setSearch, query, items, busy, error, refresh, loadMore } = useSearchPage(fetchWithQuery);

  const showPinned = defaultBranch !== null && defaultBranch.toLowerCase().includes(query.toLowerCase());
  const rows: BranchRow[] = [
    ...(showPinned ? [{ name: defaultBranch, isDefault: true }] : []),
    ...items.filter((branch) => branch.name !== defaultBranch).map(({ name }) => ({ name, isDefault: false })),
  ];

  return (
    <Screen title="Branches" subtitle={projectName} onBack={navigation.goBack}>
      <SearchList
        data={rows}
        keyExtractor={(row) => row.name}
        renderItem={(row) => (
          <ListRow
            title={row.name}
            monoTitle
            tag={row.isDefault ? 'default' : undefined}
            accentTag
            onPress={() => navigation.navigate('Branch', { projectId, projectName, branch: row.name })}
          />
        )}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches"
        busy={busy}
        error={error}
        onRefresh={refresh}
        onEndReached={loadMore}
        loadingLabel="Loading branches"
        emptyTitle="No branches found"
        emptyHint="Try a different search."
      />
    </Screen>
  );
}
