import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { fetchProjects } from '../api/projects';
import { AppText } from '../components/AppText';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { SearchList } from '../components/SearchList';
import { TextButton } from '../components/TextButton';
import { useGitlabHost } from '../hooks/useGitlabHost';
import { useRecentProjects } from '../hooks/useRecentProjects';
import { useSearchPage } from '../hooks/useSearchPage';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { rememberProject, type RecentProject } from '../storage/recentProjects';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

export function ProjectsScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const host = useGitlabHost();
  const recent = useRecentProjects();
  const { search, setSearch, items, busy, error, refresh, loadMore } = useSearchPage(fetchProjects);

  function openProject(project: RecentProject) {
    rememberProject(project);
    navigation.navigate('Branches', { projectId: project.id, projectName: project.name });
  }

  const renderProject = (project: RecentProject) => (
    <ListRow
      key={project.id}
      title={project.name}
      subtitle={project.path}
      tag={String(project.id)}
      onPress={() => openProject(project)}
    />
  );

  const showRecent = search.trim() === '' && recent.length > 0;

  return (
    <Screen>
      <View style={tw`min-h-14 flex-row items-center justify-between border-b border-line pl-4 pr-1.5`}>
        <AppText variant="small" mono numberOfLines={1} style={tw`flex-1 text-xs`}>
          {host}
        </AppText>
        <TextButton label="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>
      <View style={tw`border-b border-line px-4 pb-3.5 pt-6`}>
        <AppText variant="display">Projects</AppText>
      </View>
      <SearchList
        data={items}
        keyExtractor={(project) => String(project.id)}
        renderItem={({ id, name, path_with_namespace }) =>
          renderProject({ id, name, path: path_with_namespace })
        }
        header={
          showRecent ? (
            <View>
              <SectionHeader title="Recent" />
              {recent.map(renderProject)}
              <SectionHeader title="All projects" />
            </View>
          ) : undefined
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects"
        busy={busy}
        error={error}
        onRefresh={refresh}
        onEndReached={loadMore}
        loadingLabel="Loading projects"
        emptyTitle="No projects found"
        emptyHint="Try a different search. The list shows projects the token's user is a member of."
      />
    </Screen>
  );
}
