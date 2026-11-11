import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { fetchCiVariables } from '../api/ciVariables';
import { describeError } from '../api/errors';
import { createPipeline, fetchPipelines, type CreatedPipeline } from '../api/pipelines';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { CustomVariableRows } from '../components/CustomVariableRows';
import { ErrorView } from '../components/ErrorView';
import { LoadingRow } from '../components/LoadingRow';
import { PipelineRow } from '../components/PipelineRow';
import { RunConfirmDialog } from '../components/RunConfirmDialog';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { VariableFields } from '../components/VariableFields';
import { useAsync } from '../hooks/useAsync';
import { usePipelineForm } from '../hooks/usePipelineForm';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme';
import { formatPipelineDuration, formatRelativeTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Branch'>;

export function BranchScreen({ navigation, route }: Props) {
  const { projectId, projectName, branch } = route.params;
  const { tw, colors } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runError, setRunError] = useState<unknown>();
  const [created, setCreated] = useState<CreatedPipeline>();

  const loadVariables = useCallback(() => fetchCiVariables(projectId, branch), [projectId, branch]);
  const loadPipelines = useCallback(() => fetchPipelines(projectId, branch), [projectId, branch]);
  const ci = useAsync(loadVariables);
  const pipelines = useAsync(loadPipelines);
  const form = usePipelineForm(ci.data?.variables);

  async function runPipeline() {
    setSubmitting(true);
    setRunError(undefined);
    try {
      setCreated(await createPipeline(projectId, branch, form.entries));
      pipelines.reload();
    } catch (error) {
      setRunError(error);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  const variableCount = ci.data?.variables.length ?? 0;
  const runFailure = runError ? describeError(runError) : undefined;

  return (
    <Screen
      title={branch}
      subtitle={projectName}
      monoTitle
      onBack={navigation.goBack}
      scroll
      refreshControl={
        <RefreshControl
          refreshing={ci.refreshing || pipelines.refreshing}
          onRefresh={() => {
            ci.reload();
            pipelines.reload();
          }}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.card}
        />
      }
    >
      <SectionHeader
        title="Run pipeline"
        right={variableCount > 0 ? `${variableCount} variable${variableCount > 1 ? 's' : ''}` : undefined}
      />
      <View style={tw`gap-4 px-4`}>
        {ci.loading && <LoadingRow label="Loading variables" />}
        {ci.error !== undefined && <ErrorView error={ci.error} onRetry={ci.reload} />}
        {ci.data && ci.data.lintErrors.length > 0 && (
          <Banner
            variant="failed"
            title="CI config didn't pass lint"
            message="Fix .gitlab-ci.yml on this branch, then pull to refresh."
            detail={ci.data.lintErrors.join('\n')}
          />
        )}
        {ci.data?.usedFallback && (
          <Banner
            variant="manual"
            title="include: files not resolved"
            message="The config pulls in files this app couldn't read, so declared variables aren't listed. You can still run the pipeline and add variables by hand."
          />
        )}
        <VariableFields variables={ci.data?.variables ?? []} edits={form.edits} onChange={form.setValue} />
        <CustomVariableRows
          rows={form.customRows}
          errors={form.customErrors}
          onAdd={form.addCustom}
          onChange={form.updateCustom}
          onRemove={form.removeCustom}
        />
        {runFailure && <Banner variant="failed" {...runFailure} />}
        {created && (
          <Banner variant="success" title={`Pipeline #${created.id} created`} message={`Status: ${created.status}`} />
        )}
        <Button
          variant="primary"
          label="Run pipeline"
          onPress={() => setConfirmOpen(true)}
          disabled={!form.canRun || ci.loading}
          style={tw`mt-2`}
        />
      </View>

      <SectionHeader title="Recent pipelines" bordered />
      {pipelines.loading && <LoadingRow label="Loading pipelines" />}
      {pipelines.error !== undefined && <ErrorView error={pipelines.error} onRetry={pipelines.reload} />}
      {pipelines.data?.length === 0 && (
        <AppText variant="small" style={tw`p-4`}>
          No pipelines on this branch yet.
        </AppText>
      )}
      {pipelines.data?.map((pipeline) => (
        <PipelineRow
          key={pipeline.id}
          id={pipeline.id}
          status={pipeline.status}
          ago={formatRelativeTime(pipeline.created_at)}
          duration={formatPipelineDuration(pipeline.created_at, pipeline.updated_at, pipeline.status)}
        />
      ))}

      <RunConfirmDialog
        visible={confirmOpen}
        branch={branch}
        projectName={projectName}
        entries={form.entries}
        submitting={submitting}
        onConfirm={runPipeline}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
