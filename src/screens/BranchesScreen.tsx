import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SearchList } from '../components/SearchList';
import { useSearchPage } from '../hooks/useSearchPage';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Branches'>;

type BranchRow = { name: string; isDefault: boolean };

export function BranchesScreen({ navigation, route }: Props) {
  const { project } = route.params;
  const provider = useProvider();
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);

  useEffect(() => {
    provider.getDefaultBranch(project).then(setDefaultBranch, () => setDefaultBranch(null));
  }, [provider, project]);

  const fetchWithQuery = useCallback(
    (query: string, page: number) => provider.listBranches(project, query, page),
    [provider, project],
  );
  const { search, setSearch, query, items, busy, error, refresh, loadMore } = useSearchPage(fetchWithQuery);

  const showPinned = defaultBranch !== null && defaultBranch.toLowerCase().includes(query.toLowerCase());
  const rows: BranchRow[] = [
    ...(showPinned ? [{ name: defaultBranch, isDefault: true }] : []),
    ...items.filter((name) => name !== defaultBranch).map((name) => ({ name, isDefault: false })),
  ];

  return (
    <Screen title="Branches" subtitle={project.name} onBack={navigation.goBack}>
      <SearchList
        data={rows}
        keyExtractor={(row) => row.name}
        renderItem={(row) => (
          <ListRow
            title={row.name}
            monoTitle
            tag={row.isDefault ? 'default' : undefined}
            accentTag
            onPress={() => navigation.navigate('Branch', { project, branch: row.name })}
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
