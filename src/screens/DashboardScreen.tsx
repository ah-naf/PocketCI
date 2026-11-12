import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
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

  function openFavorite({ project, runs }: FavoriteRun) {
    if (runs[0]) navigation.navigate('Pipeline', { project, runId: runs[0].id });
    else navigation.navigate('Branches', { project });
  }

  return (
    <Screen
      title="Following"
      onBack={navigation.goBack}
      scroll
      refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={reload} />}
    >
      {rows.length === 0 && (
        <EmptyState
          title="Not following anything yet"
          hint={`Tap the eye on a ${provider.labels.project.toLowerCase()} to follow it and see its latest ${provider.labels.run} here.`}
        />
      )}
      {rows.map((row) => (
        <View key={row.project.key}>
          <ProjectStatusRow
            name={row.project.name}
            detail={row.runs[0]?.ref ?? row.project.path}
            status={row.runs[0]?.status ?? null}
            fallback={row.unavailable ? 'Unavailable' : row.loading ? 'Loading' : 'No runs'}
            ago={row.runs[0] ? formatRelativeTime(row.runs[0].createdAt) : ''}
            onPress={() => openFavorite(row)}
          />
          {row.runs.slice(1).map((run) => (
            <ProjectStatusRow
              key={run.id}
              nested
              name={run.ref}
              detail={`#${run.id}`}
              status={run.status}
              fallback=""
              ago={formatRelativeTime(run.createdAt)}
              onPress={() => navigation.navigate('Pipeline', { project: row.project, runId: run.id })}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}
