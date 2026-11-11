import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { describeError } from '../api/errors';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { AppText } from '../components/AppText';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { CustomVariableRows } from '../components/CustomVariableRows';
import { ErrorView } from '../components/ErrorView';
import { FilterChips } from '../components/FilterChips';
import { LoadingRow } from '../components/LoadingRow';
import { PickerField } from '../components/PickerField';
import { PipelineRow } from '../components/PipelineRow';
import { RunConfirmDialog } from '../components/RunConfirmDialog';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { VariableFields } from '../components/VariableFields';
import { useAsync } from '../hooks/useAsync';
import { usePaginated } from '../hooks/usePaginated';
import { usePipelineForm } from '../hooks/usePipelineForm';
import { usePoll } from '../hooks/usePoll';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import type { RunFilter } from '../providers/types';
import { useTheme } from '../theme';
import { formatPipelineDuration, formatRelativeTime } from '../utils/format';
import { isPipelineActive, RUN_FILTERS } from '../utils/status';

type Props = NativeStackScreenProps<RootStackParamList, 'Branch'>;

const RUNS_POLL_INTERVAL_MS = 5000;

export function BranchScreen({ navigation, route }: Props) {
  const { project, branch } = route.params;
  const { tw } = useTheme();
  const provider = useProvider();
  const { run, runs: runsLabel, target: targetNoun } = provider.labels;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runError, setRunError] = useState<unknown>();
  const [targetId, setTargetId] = useState<string>();
  const [startedNotice, setStartedNotice] = useState(false);
  const [runFilter, setRunFilter] = useState<RunFilter>('all');

  const loadOptions = useCallback(() => provider.getRunOptions(project, branch), [provider, project, branch]);
  const fetchRunsPage = useCallback(
    (page: number) => provider.listRuns(project, branch, runFilter, page),
    [provider, project, branch, runFilter],
  );
  const options = useAsync(loadOptions);
  const runs = usePaginated(fetchRunsPage);
  const focused = useIsFocused();
  const hasActiveRun = runs.items.some((item) => isPipelineActive(item.status));
  const filterLabel = RUN_FILTERS.find((option) => option.id === runFilter)?.label.toLowerCase();

  usePoll(runs.poll, RUNS_POLL_INTERVAL_MS, focused && (hasActiveRun || startedNotice));
  useFocusEffect(
    useCallback(() => {
      runs.poll();
    }, [runs.poll]),
  );
  useEffect(() => {
    if (hasActiveRun) setStartedNotice(false);
  }, [hasActiveRun]);
  const targets = options.data?.targets ?? [];
  const target = targets.find((item) => item.id === targetId) ?? targets.find((item) => item.runnable) ?? targets[0];
  const form = usePipelineForm(target?.inputs);
  const targetLabel = provider.labels.target.charAt(0).toUpperCase() + provider.labels.target.slice(1);

  function selectTarget(name: string) {
    setTargetId(targets.find((item) => item.name === name)?.id);
    form.reset();
  }

  const openRun = (runId: string) => navigation.navigate('Pipeline', { project, runId });

  async function startRun() {
    if (!target) return;
    setSubmitting(true);
    setRunError(undefined);
    setStartedNotice(false);
    setRunFilter('all');
    try {
      const started = await provider.startRun(project, branch, { targetId: target.id, inputs: form.entries });
      runs.poll();
      if (started.runId) openRun(started.runId);
      else setStartedNotice(true);
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
          refreshing={options.refreshing || runs.busy === 'refresh'}
          onRefresh={() => {
            options.reload();
            runs.refresh();
          }}
        />
      }
    >
      <SectionHeader
        title={`Run ${targetNoun}`}
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
        {targets.length > 1 && target && (
          <PickerField
            label={targetLabel}
            value={target.name}
            options={targets.map((item) => item.name)}
            isOptionDisabled={(name) => targets.find((item) => item.name === name)?.reason}
            onChange={selectTarget}
          />
        )}
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
        {startedNotice && (
          <Banner
            variant="manual"
            title="Started"
            message={`The ${run} will appear in Recent ${runsLabel} shortly. Pull down to refresh.`}
          />
        )}
        <Button
          variant="primary"
          label={`Run ${targetNoun}`}
          onPress={() => setConfirmOpen(true)}
          disabled={!form.canRun || options.loading || !target?.runnable}
          style={tw`mt-2`}
        />
      </View>

      <SectionHeader title={`Recent ${runsLabel}`} bordered />
      <FilterChips options={RUN_FILTERS} value={runFilter} onChange={(id) => setRunFilter(id as RunFilter)} />
      {runs.busy === 'initial' && <LoadingRow label={`Loading ${runsLabel}`} />}
      {runs.busy === 'idle' && runs.error == null && runs.items.length === 0 && (
        <AppText variant="small" style={tw`p-4`}>
          {runFilter === 'all'
            ? `No ${runsLabel} on this branch yet.`
            : `No ${filterLabel} ${runsLabel} on this branch.`}
        </AppText>
      )}
      {runs.items.map((item) => (
        <PipelineRow
          key={item.id}
          id={item.id}
          title={item.title}
          status={item.status}
          ago={formatRelativeTime(item.createdAt)}
          duration={formatPipelineDuration(item.createdAt, item.updatedAt, item.status)}
          onPress={() => openRun(item.id)}
        />
      ))}
      {runs.error != null && <ErrorView error={runs.error} onRetry={runs.refresh} />}
      {runs.hasMore && (
        <Button
          variant="ghost"
          label="Load more"
          onPress={runs.loadMore}
          loading={runs.busy === 'more'}
          style={tw`m-4`}
        />
      )}

      <RunConfirmDialog
        visible={confirmOpen}
        branch={branch}
        projectName={project.name}
        entries={form.entries}
        actionLabel={targetNoun}
        runLabel={run}
        serviceName={provider.displayName}
        submitting={submitting}
        onConfirm={startRun}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
