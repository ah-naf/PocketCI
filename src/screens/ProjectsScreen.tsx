import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { ListRow } from '../components/ListRow';
import { ProviderSwitchSheet } from '../components/ProviderSwitchSheet';
import { Screen } from '../components/Screen';
import { SearchList } from '../components/SearchList';
import { SectionHeader } from '../components/SectionHeader';
import { useProviderHost } from '../hooks/useProviderHost';
import { useRecentProjects } from '../hooks/useRecentProjects';
import { useSearchPage } from '../hooks/useSearchPage';
import { useThemeToggle } from '../hooks/useThemeToggle';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider, useProviderSwitch } from '../providers/ProviderContext';
import type { ProjectRef, ProviderId } from '../providers/types';
import { rememberProject } from '../storage/recentProjects';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

const groupByOwner = (project: ProjectRef) => project.path.split('/')[0];

export function ProjectsScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const provider = useProvider();
  const { providers, switchTo } = useProviderSwitch();
  const plural = provider.labels.projects.toLowerCase();
  const host = useProviderHost();
  const recent = useRecentProjects(provider.id);
  const themeToggle = useThemeToggle();
  const [switchOpen, setSwitchOpen] = useState(false);

  const fetchWithQuery = useCallback(
    (query: string, page: number) => provider.listProjects(query, page),
    [provider],
  );
  const { search, setSearch, items, busy, error, refresh, loadMore } = useSearchPage(fetchWithQuery);

  async function selectProvider(id: ProviderId) {
    setSwitchOpen(false);
    if (id === provider.id) return;
    setSearch('');
    const hasToken = await switchTo(id);
    if (!hasToken) navigation.reset({ index: 0, routes: [{ name: 'Setup' }] });
  }

  function openProject(project: ProjectRef) {
    rememberProject(project);
    navigation.navigate('Branches', { project });
  }

  const renderProject = (project: ProjectRef) => (
    <ListRow
      key={project.key}
      title={project.name}
      subtitle={project.path}
      tag={project.key === project.path ? undefined : project.key}
      onPress={() => openProject(project)}
    />
  );

  const showRecent = search.trim() === '' && recent.length > 0;

  return (
    <Screen>
      <View style={tw`min-h-14 flex-row items-center gap-2 border-b border-line pl-4 pr-1`}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch provider"
          onPress={() => setSwitchOpen(true)}
          style={tw`h-9 flex-row items-center gap-1.5 rounded-full border border-line px-3`}
        >
          <AppText variant="small" tone="accent" style={tw`font-sans-semibold`}>
            {provider.displayName}
          </AppText>
          <Icon name="chevronDown" color="accent" size={16} />
        </Pressable>
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
        groupBy={groupByOwner}
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
      <ProviderSwitchSheet
        visible={switchOpen}
        options={providers.map(({ id, displayName }) => ({ id, displayName }))}
        active={provider.id}
        onSelect={selectProvider}
        onClose={() => setSwitchOpen(false)}
      />
    </Screen>
  );
}
