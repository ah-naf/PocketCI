import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, View } from 'react-native';
import { ApiError, describeError } from '../api/errors';
import { AppRefreshControl } from '../components/AppRefreshControl';
import { AppText } from '../components/AppText';
import { DetailsCard } from '../components/DetailsCard';
import { ErrorView } from '../components/ErrorView';
import { LiveBadge } from '../components/LiveBadge';
import { LoadingRow } from '../components/LoadingRow';
import { PipelineSummaryCard } from '../components/PipelineSummaryCard';
import { Screen } from '../components/Screen';
import { StageSection } from '../components/StageSection';
import { VariableList } from '../components/VariableList';
import { useAsync } from '../hooks/useAsync';
import { useNow } from '../hooks/useNow';
import { usePoll } from '../hooks/usePoll';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { confirmAction } from '../utils/confirmAction';
import { confirmCancel } from '../utils/confirmCancel';
import { formatDateTime, formatPipelineElapsed } from '../utils/format';
import { groupJobsByStage } from '../utils/stages';
import { isPipelineActive } from '../utils/status';

type Props = NativeStackScreenProps<RootStackParamList, 'Pipeline'>;

const POLL_INTERVAL_MS = 4000;
const WATCH_AFTER_CHANGE_MS = 20000;

export function PipelineScreen({ navigation, route }: Props) {
  const { project, runId } = route.params;
  const { tw } = useTheme();
  const provider = useProvider();
  const focused = useIsFocused();

  const loadRun = useCallback(() => provider.getRun(project, runId), [provider, project, runId]);
  const loadJobs = useCallback(() => provider.listJobs(project, runId), [provider, project, runId]);
  const run = useAsync(loadRun);
  const jobs = useAsync(loadJobs);
  const loadVariables = useCallback(() => provider.getRunVariables(project, runId), [provider, project, runId]);
  const variables = useAsync(loadVariables);

  const [watching, setWatching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      run.poll();
      jobs.poll();
      setWatching(true);
    }, [run.poll, jobs.poll]),
  );

  useEffect(() => {
    if (!watching) return;
    const timer = setTimeout(() => setWatching(false), WATCH_AFTER_CHANGE_MS);
    return () => clearTimeout(timer);
  }, [watching]);

  const active = run.data ? isPipelineActive(run.data.status) : true;
  const now = useNow(active);
  usePoll(
    () => {
      run.poll();
      jobs.poll();
    },
    POLL_INTERVAL_MS,
    (active || watching) && focused,
  );

  const cancelRunningRun = () =>
    confirmCancel(provider.labels.run, provider.displayName, () => provider.cancelRun(project, runId), () => {
      run.poll();
      jobs.poll();
    });

  const wasCanceled = run.data?.status === 'canceled';
  const retryLabel = wasCanceled ? 'Run again' : 'Retry failed jobs';

  const retryRun = () =>
    confirmAction(
      {
        title: `${retryLabel}?`,
        message: wasCanceled
          ? `${provider.displayName} starts the canceled jobs again from the beginning. Work that was already done is not resumed.`
          : `${provider.displayName} runs the failed jobs in this ${provider.labels.run} again.`,
        confirmLabel: wasCanceled ? 'Run again' : 'Retry',
        dismissLabel: 'Not now',
      },
      () => provider.retryRun(project, runId),
      () => {
        run.poll();
        jobs.poll();
        setWatching(true);
      },
    );

  const forceCancelRunningRun = () =>
    confirmCancel(
      provider.labels.run,
      provider.displayName,
      () => provider.forceCancelRun(project, runId),
      () => {
        run.poll();
        jobs.poll();
      },
      true,
    );

  const variablesBlocked = variables.error instanceof ApiError && variables.error.status === 403;
  const variablesNote = variablesBlocked
    ? `${provider.displayName} shows a run's variables only to project Maintainers or higher. Your role in this project can't read them.`
    : `Could not load variables. ${describeError(variables.error, provider.displayName).message}`;

  const stages = useMemo(() => groupJobsByStage(jobs.data ?? []), [jobs.data]);
  const error = run.error ?? jobs.error;

  return (
    <Screen
      title={`#${runId}`}
      subtitle={project.name}
      monoTitle
      headerRight={active && run.data ? <LiveBadge /> : undefined}
      onBack={navigation.goBack}
      scroll
      refreshControl={
        <AppRefreshControl
          refreshing={run.refreshing || jobs.refreshing}
          onRefresh={() => {
            run.reload();
            jobs.reload();
          }}
        />
      }
    >
      {run.loading && <LoadingRow label={`Loading ${provider.labels.run}`} />}
      {error !== undefined && <ErrorView error={error} onRetry={run.reload} />}
      {run.data && (
        <PipelineSummaryCard
          pipeline={run.data}
          elapsed={formatPipelineElapsed(run.data, now)}
          openLabel={`Open in ${provider.displayName}`}
          cancelLabel={`Cancel ${provider.labels.run}`}
          onOpenExternal={() => Linking.openURL(run.data?.webUrl ?? '')}
          retryLabel={retryLabel}
          onRetry={run.data.status === 'failed' || wasCanceled ? retryRun : undefined}
          onCancel={active && run.data.status !== 'canceling' ? cancelRunningRun : undefined}
          onForceCancel={active && provider.capabilities.forceCancelRun ? forceCancelRunningRun : undefined}
        />
      )}
      {run.data && (
        <View style={tw`mx-4 mt-3`}>
          <DetailsCard
            rows={[
              { label: 'Started by', value: run.data.triggeredBy },
              { label: 'Triggered via', value: run.data.source, mono: true },
              { label: 'Commit', value: run.data.commitTitle },
              { label: 'Created', value: formatDateTime(run.data.createdAt) },
              { label: 'Started', value: run.data.startedAt ? formatDateTime(run.data.startedAt) : null },
              { label: 'Finished', value: run.data.finishedAt ? formatDateTime(run.data.finishedAt) : null },
            ]}
          />
        </View>
      )}
      {provider.capabilities.runVariables && (
        <View style={tw`mx-4 mt-4 gap-1.5`}>
          <AppText variant="label">Variables{variables.data ? ` · ${variables.data.length}` : ''}</AppText>
          {variables.error !== undefined ? (
            <AppText variant="caption" tone={variablesBlocked ? 'muted' : 'failed'}>
              {variablesNote}
            </AppText>
          ) : (
            <View style={tw`overflow-hidden rounded-2xl border border-line bg-card`}>
              <VariableList entries={variables.data ?? []} />
            </View>
          )}
        </View>
      )}
      <View style={tw`pb-8 pt-4`}>
        {stages.map((stage) => (
          <StageSection
            key={stage.name}
            stage={stage}
            now={now}
            onJobPress={(job) =>
              navigation.navigate('JobLog', {
                project,
                jobId: job.id,
                jobName: job.name,
                status: job.status,
              })
            }
          />
        ))}
        {jobs.data?.length === 0 && (
          <AppText variant="small" style={tw`px-4`}>
            No jobs yet.
          </AppText>
        )}
      </View>
    </Screen>
  );
}
