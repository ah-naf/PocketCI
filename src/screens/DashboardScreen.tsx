import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { EmptyState } from '../components/EmptyState';
import { ProjectStatusRow } from '../components/ProjectStatusRow';
import { Screen } from '../components/Screen';
import { useFavoriteProjects } from '../hooks/useFavoriteProjects';
import { useFavoriteRuns, type FavoriteRun } from '../hooks/useFavoriteRuns';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import { formatRelativeTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const provider = useProvider();
  const { favorites } = useFavoriteProjects(provider.id);
  const { rows, reload, refreshing } = useFavoriteRuns(favorites);

  function openFavorite({ project, run }: FavoriteRun) {
    if (run) navigation.navigate('Pipeline', { project, runId: run.id });
    else navigation.navigate('Branches', { project });
  }

  return (
    <Screen
      title="Dashboard"
      onBack={navigation.goBack}
      scroll
      refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={reload} />}
    >
      {rows.length === 0 && (
        <EmptyState
          title="No favorites yet"
          hint={`Star a ${provider.labels.project.toLowerCase()} on the list to see its latest ${provider.labels.run} here.`}
        />
      )}
      {rows.map((row) => (
        <ProjectStatusRow
          key={row.project.key}
          name={row.project.name}
          detail={row.run?.ref ?? row.project.path}
          status={row.run?.status ?? null}
          fallback={row.unavailable ? 'Unavailable' : 'No runs'}
          ago={row.run ? formatRelativeTime(row.run.createdAt) : ''}
          onPress={() => openFavorite(row)}
        />
      ))}
    </Screen>
  );
}
