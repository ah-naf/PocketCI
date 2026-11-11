import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { describeError } from '../api/errors';
import { AppRefreshControl } from '../components/AppRefreshControl';
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
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { formatPipelineDuration, formatRelativeTime } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Branch'>;

export function BranchScreen({ navigation, route }: Props) {
  const { project, branch } = route.params;
  const { tw } = useTheme();
  const provider = useProvider();
  const { run, runs: runsLabel } = provider.labels;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runError, setRunError] = useState<unknown>();

  const loadOptions = useCallback(() => provider.getRunOptions(project, branch), [provider, project, branch]);
  const loadRuns = useCallback(() => provider.listRuns(project, branch), [provider, project, branch]);
  const options = useAsync(loadOptions);
  const runs = useAsync(loadRuns);
  const target = options.data?.targets[0];
  const form = usePipelineForm(target?.inputs);

  const openRun = (runId: string) => navigation.navigate('Pipeline', { project, runId });

  async function startRun() {
    if (!target) return;
    setSubmitting(true);
    setRunError(undefined);
    try {
      const started = await provider.startRun(project, branch, { targetId: target.id, inputs: form.entries });
      runs.poll();
      if (started.runId) openRun(started.runId);
    } catch (error) {
      setRunError(error);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  const inputCount = target?.inputs.length ?? 0;
  const runFailure = runError ? describeError(runError) : undefined;

  return (
    <Screen
      title={branch}
      subtitle={project.name}
      monoTitle
      onBack={navigation.goBack}
      scroll
      refreshControl={
        <AppRefreshControl
          refreshing={options.refreshing || runs.refreshing}
          onRefresh={() => {
            options.reload();
            runs.reload();
          }}
        />
      }
    >
      <SectionHeader
        title={`Run ${run}`}
        right={inputCount > 0 ? `${inputCount} variable${inputCount > 1 ? 's' : ''}` : undefined}
      />
      <View style={tw`gap-4 px-4`}>
        {options.loading && <LoadingRow label="Loading variables" />}
        {options.error !== undefined && <ErrorView error={options.error} onRetry={options.reload} />}
        {options.data?.notices.map((notice) => (
          <Banner
            key={notice.title}
            variant={notice.kind === 'error' ? 'failed' : 'manual'}
            title={notice.title}
            message={notice.message}
            detail={notice.detail}
          />
        ))}
        <VariableFields variables={target?.inputs ?? []} edits={form.edits} onChange={form.setValue} />
        {options.data?.allowCustomInputs && (
          <CustomVariableRows
            rows={form.customRows}
            errors={form.customErrors}
            onAdd={form.addCustom}
            onChange={form.updateCustom}
            onRemove={form.removeCustom}
          />
        )}
        {runFailure && <Banner variant="failed" {...runFailure} />}
        <Button
          variant="primary"
          label={`Run ${run}`}
          onPress={() => setConfirmOpen(true)}
          disabled={!form.canRun || options.loading || !target?.runnable}
          style={tw`mt-2`}
        />
      </View>

      <SectionHeader title={`Recent ${runsLabel}`} bordered />
      {runs.loading && <LoadingRow label={`Loading ${runsLabel}`} />}
      {runs.error !== undefined && <ErrorView error={runs.error} onRetry={runs.reload} />}
      {runs.data?.length === 0 && (
        <AppText variant="small" style={tw`p-4`}>
          No {runsLabel} on this branch yet.
        </AppText>
      )}
      {runs.data?.map((item) => (
        <PipelineRow
          key={item.id}
          id={item.id}
          status={item.status}
          ago={formatRelativeTime(item.createdAt)}
          duration={formatPipelineDuration(item.createdAt, item.updatedAt, item.status)}
          onPress={() => openRun(item.id)}
        />
      ))}

      <RunConfirmDialog
        visible={confirmOpen}
        branch={branch}
        projectName={project.name}
        entries={form.entries}
        runLabel={run}
        serviceName={provider.displayName}
        submitting={submitting}
        onConfirm={startRun}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
