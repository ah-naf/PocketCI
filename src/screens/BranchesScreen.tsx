import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SegmentedControl } from '../components/SegmentedControl';
import { SearchList } from '../components/SearchList';
import { useSearchPage } from '../hooks/useSearchPage';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { ChangeRequestList } from './ChangeRequestList';
import { LatestRuns } from './LatestRuns';

type Props = NativeStackScreenProps<RootStackParamList, 'Branches'>;

type BranchRow = { name: string; isDefault: boolean };

export function BranchesScreen({ navigation, route }: Props) {
  const { project } = route.params;
  const provider = useProvider();
  const { tw } = useTheme();
  const [view, setView] = useState<'branches' | 'runs' | 'requests'>('branches');
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);

  useEffect(() => {
    provider.getDefaultBranch(project).then(setDefaultBranch, () => setDefaultBranch(null));
  }, [provider, project]);

  const fetchWithQuery = useCallback(
    (query: string, page: number) => provider.listBranches(project, query, page),
    [provider, project],
  );
  const { search, setSearch, query, items, busy, error, refresh, loadMore } = useSearchPage(['branches', project.key], fetchWithQuery);

  const showPinned = defaultBranch !== null && defaultBranch.toLowerCase().includes(query.toLowerCase());
  const rows: BranchRow[] = [
    ...(showPinned ? [{ name: defaultBranch, isDefault: true }] : []),
    ...items.filter((name) => name !== defaultBranch).map((name) => ({ name, isDefault: false })),
  ];

  return (
    <Screen title={project.name} subtitle={project.path} onBack={navigation.goBack}>
      <View style={tw`px-4 pb-1 pt-3`}>
        <SegmentedControl
          options={[
            { id: 'branches', label: 'Branches' },
            { id: 'runs', label: provider.labels.runs.charAt(0).toUpperCase() + provider.labels.runs.slice(1) },
            { id: 'requests', label: provider.labels.changeRequests },
          ]}
          value={view}
          onChange={setView}
        />
      </View>
      {view === 'runs' ? (
        <LatestRuns project={project} onOpenRun={(runId) => navigation.navigate('Pipeline', { project, runId })} />
      ) : view === 'requests' ? (
        <ChangeRequestList
          project={project}
          onOpen={(requestId) => navigation.navigate('ChangeRequest', { project, requestId })}
        />
      ) : (
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
      )}
    </Screen>
  );
}
