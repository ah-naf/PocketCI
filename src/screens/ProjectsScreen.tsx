import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { IconButton } from '../components/IconButton';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { SearchList } from '../components/SearchList';
import { useGitlabHost } from '../hooks/useGitlabHost';
import { useRecentProjects } from '../hooks/useRecentProjects';
import { useSearchPage } from '../hooks/useSearchPage';
import { useThemeToggle } from '../hooks/useThemeToggle';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import type { ProjectRef } from '../providers/types';
import { rememberProject } from '../storage/recentProjects';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

export function ProjectsScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const provider = useProvider();
  const plural = provider.labels.projects.toLowerCase();
  const host = useGitlabHost();
  const recent = useRecentProjects();
  const themeToggle = useThemeToggle();
  const fetchWithQuery = useCallback(
    (query: string, page: number) => provider.listProjects(query, page),
    [provider],
  );
  const { search, setSearch, items, busy, error, refresh, loadMore } = useSearchPage(fetchWithQuery);

  function openProject(project: ProjectRef) {
    rememberProject(project);
    navigation.navigate('Branches', { project });
  }

  const renderProject = (project: ProjectRef) => (
    <ListRow
      key={project.key}
      title={project.name}
      subtitle={project.path}
      tag={project.key}
      onPress={() => openProject(project)}
    />
  );

  const showRecent = search.trim() === '' && recent.length > 0;

  return (
    <Screen>
      <View style={tw`min-h-14 flex-row items-center justify-between border-b border-line pl-4 pr-1`}>
        <AppText variant="small" mono numberOfLines={1} style={tw`flex-1 text-xs`}>
          {host}
        </AppText>
        <IconButton
          icon={themeToggle.nextScheme === 'light' ? 'sun' : 'moon'}
          label={`Switch to ${themeToggle.nextScheme} theme`}
          onPress={themeToggle.toggle}
        />
        <IconButton icon="sliders" label="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>
      <View style={tw`border-b border-line px-4 pb-3.5 pt-6`}>
        <AppText variant="display">{provider.labels.projects}</AppText>
      </View>
      <SearchList
        data={items}
        keyExtractor={(project) => project.key}
        renderItem={renderProject}
        header={
          showRecent ? (
            <View>
              <SectionHeader title="Recent" />
              {recent.map(renderProject)}
              <SectionHeader title={`All ${plural}`} />
            </View>
          ) : undefined
        }
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${plural}`}
        busy={busy}
        error={error}
        onRefresh={refresh}
        onEndReached={loadMore}
        loadingLabel={`Loading ${plural}`}
        emptyTitle={`No ${plural} found`}
        emptyHint={`Try a different search. The list shows ${plural} the token's user is a member of.`}
      />
    </Screen>
  );
}
