import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { fetchProject } from '../api/projects';
import { AddProjectSheet } from '../components/AddProjectSheet';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { EmptyState } from '../components/EmptyState';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { useProjects } from '../hooks/useProjects';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { addProject, removeProject, type SavedProject } from '../storage/projects';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

export function ProjectsScreen({ navigation }: Props) {
  const { tw } = useTheme();
  const { projects, host, loaded, reload } = useProjects();
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<SavedProject | null>(null);

  async function addProjectById(projectId: string) {
    const project = await fetchProject(projectId);
    await addProject({ id: project.id, name: project.name, path: project.path_with_namespace });
    await reload();
    setAddOpen(false);
  }

  async function confirmRemove() {
    if (!removing) return;
    await removeProject(removing.id);
    setRemoving(null);
    await reload();
  }

  const openAddSheet = () => setAddOpen(true);

  return (
    <Screen>
      <View style={tw`min-h-14 flex-row items-center justify-between border-b border-line pl-4 pr-1.5`}>
        <AppText variant="small" mono numberOfLines={1} style={tw`flex-1 text-xs`}>
          {host}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Settings')}
          style={tw`h-11 justify-center px-3`}
        >
          <AppText variant="small" tone="accent" style={tw`font-sans-semibold`}>
            Settings
          </AppText>
        </Pressable>
      </View>
      <View style={tw`flex-row items-end justify-between border-b border-line px-4 pb-3.5 pt-6`}>
        <AppText variant="display">Projects</AppText>
        {projects.length > 0 && <AppText variant="label">{projects.length} saved</AppText>}
      </View>

      {loaded && projects.length === 0 && (
        <EmptyState
          title="Nothing saved yet"
          hint="Add a project by its numeric ID. In GitLab it sits under the project name, and in Settings → General."
          leading={
            <AppText mono tone="dim" style={tw`text-[56px] leading-[56px] font-mono-medium`}>
              0<AppText mono tone="dim" style={tw`text-base`}> / projects</AppText>
            </AppText>
          }
          action={{ label: '+ Add project', onPress: openAddSheet }}
        >
          <View style={tw`rounded-xl border border-line bg-card px-3 py-2.5`}>
            <AppText variant="caption" mono tone="muted">
              Project ID: <AppText variant="caption" mono tone="accent">1042</AppText>
            </AppText>
          </View>
        </EmptyState>
      )}

      {projects.length > 0 && (
        <FlatList
          data={projects}
          keyExtractor={(project) => String(project.id)}
          contentContainerStyle={tw`pb-28`}
          renderItem={({ item }) => (
            <ListRow
              title={item.name}
              subtitle={item.path}
              tag={String(item.id)}
              onPress={() =>
                navigation.navigate('Branches', { projectId: item.id, projectName: item.name })
              }
              onLongPress={() => setRemoving(item)}
            />
          )}
          ListFooterComponent={
            <AppText variant="caption" style={tw`px-4 pt-4`}>
              Long-press a project to remove it.
            </AppText>
          }
        />
      )}

      {projects.length > 0 && (
        <Button
          variant="primary"
          label="+ Add project"
          onPress={openAddSheet}
          style={tw`absolute bottom-7 right-4 h-[52px] rounded-2xl px-5`}
        />
      )}

      <AddProjectSheet visible={addOpen} onClose={() => setAddOpen(false)} onAdd={addProjectById} />
      <ConfirmSheet
        visible={removing !== null}
        title={`Remove ${removing?.name ?? ''}?`}
        message={
          <>
            It only leaves this list. Nothing changes in GitLab, and you can add it again with ID{' '}
            <AppText variant="small" mono tone="fg">
              {removing?.id}
            </AppText>
            .
          </>
        }
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </Screen>
  );
}
