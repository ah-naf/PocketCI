import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { NoticeBar } from '../components/NoticeBar';
import { DetailsCard } from '../components/DetailsCard';
import { ErrorView } from '../components/ErrorView';
import { IconButton } from '../components/IconButton';
import { LiveBadge } from '../components/LiveBadge';
import { LoadingRow } from '../components/LoadingRow';
import { LogSearchBar } from '../components/LogSearchBar';
import { LogView } from '../components/LogView';
import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import { useAsync } from '../hooks/useAsync';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useJobLog } from '../hooks/useJobLog';
import { useLogNavigation } from '../hooks/useLogNavigation';
import { useNow } from '../hooks/useNow';
import { usePoll } from '../hooks/usePoll';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useProvider } from '../providers/ProviderContext';
import { useTheme } from '../theme';
import { getStatusStyle } from '../theme/status';
import { confirmAction } from '../utils/confirmAction';
import { confirmCancel } from '../utils/confirmCancel';
import { formatDateTime, formatJobDuration } from '../utils/format';
import { MAX_LOG_LINES, toLogLines } from '../utils/log';
import { isJobActive } from '../utils/status';

type Props = NativeStackScreenProps<RootStackParamList, 'JobLog'>;

const POLL_INTERVAL_MS = 3000;

export function JobLogScreen({ navigation, route }: Props) {
  const { project, jobId, jobName, status: initialStatus } = route.params;
  const { tw } = useTheme();
  const provider = useProvider();
  const focused = useIsFocused();
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadJob = useCallback(() => provider.getJob(project, jobId), [provider, project, jobId]);
  const job = useAsync(['job', project.key, jobId], loadJob, {
    staleTimeMs: 0,
    refetchIntervalMs: (data) => (isJobActive(data?.status ?? initialStatus) ? POLL_INTERVAL_MS : false),
  });
  const log = useJobLog(project, jobId);
  const scroll = useAutoScroll();

  const status = job.data?.status ?? initialStatus;
  const live = isJobActive(status);
  const now = useNow(live);
  usePoll(
    () => {
      if (provider.capabilities.liveLogs) log.poll();
    },
    POLL_INTERVAL_MS,
    live && focused,
  );

  useEffect(() => {
    if (!live) log.poll();
  }, [live, log.poll]);

  const allLines = useMemo(() => provider.cleanLog(log.text), [provider, log.text]);
  const skipped = showFull ? 0 : Math.max(0, allLines.length - MAX_LOG_LINES);
  const lines = useMemo(() => toLogLines(allLines, skipped), [allLines, skipped]);
  const nav = useLogNavigation(lines);

  function toggleSearch() {
    if (searchOpen) nav.reset();
    setSearchOpen(!searchOpen);
  }

  const playManualJob = () =>
    confirmAction(
      {
        title: 'Run this job?',
        message: `${provider.displayName} starts the job now.`,
        confirmLabel: 'Run job',
        dismissLabel: 'Not now',
      },
      () => provider.playJob(project, jobId),
      () => {
        job.poll();
        log.poll();
      },
    );

  const wasCanceled = status === 'canceled';

  const retryFinishedJob = () =>
    confirmAction(
      {
        title: wasCanceled ? 'Run this job again?' : 'Retry this job?',
        message: wasCanceled
          ? `${provider.displayName} starts this job again from the beginning. Work that was already done is not resumed.`
          : `${provider.displayName} runs this job again.`,
        confirmLabel: wasCanceled ? 'Run again' : 'Retry job',
        dismissLabel: 'Not now',
      },
      () => provider.retryJob(project, jobId),
      navigation.goBack,
    );

  const cancelRunningJob = () =>
    confirmCancel('job', provider.displayName, () => provider.cancelJob(project, jobId), () => {
      job.poll();
      log.poll();
    });

  async function copyLog() {
    await Clipboard.setStringAsync(allLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Screen
      title={jobName}
      monoTitle
      onBack={navigation.goBack}
      headerRight={
        <>
          {!provider.capabilities.liveLogs && <IconButton icon="refresh" label="Refresh log" onPress={log.reload} />}
          <IconButton
            icon="info"
            label="Job details"
            color={detailsOpen ? 'accent' : 'muted'}
            onPress={() => setDetailsOpen(!detailsOpen)}
          />
          <IconButton
            icon="search"
            label="Search log"
            color={searchOpen ? 'accent' : 'muted'}
            onPress={toggleSearch}
          />
          <IconButton
            icon={copied ? 'check' : 'copy'}
            label="Copy log"
            color={copied ? 'success' : 'muted'}
            onPress={copyLog}
          />
          <IconButton icon="arrowDown" label="Jump to bottom" onPress={scroll.scrollToBottom} />
        </>
      }
    >
      <View style={tw`flex-row items-center gap-2 border-b border-line px-4 py-2`}>
        <StatusBadge status={status} />
        {live && provider.capabilities.liveLogs && <LiveBadge />}
        <AppText variant="caption" mono tone="muted" style={tw`text-xs`}>
          {job.data ? formatJobDuration(job.data, now) : ''}
        </AppText>
      </View>
      {detailsOpen && job.data && (
        <View style={tw`border-b border-line px-4 py-3`}>
          <DetailsCard
            rows={[
              { label: 'Status', value: getStatusStyle(status).label },
              { label: 'Duration', value: formatJobDuration(job.data, now) },
              { label: 'Runner', value: job.data.runnerName },
              { label: 'Started', value: job.data.startedAt ? formatDateTime(job.data.startedAt) : null },
              { label: 'Finished', value: job.data.finishedAt ? formatDateTime(job.data.finishedAt) : null },
            ]}
          />
        </View>
      )}
      {searchOpen && (
        <LogSearchBar
          query={nav.query}
          onChangeQuery={nav.setQuery}
          mode={nav.mode}
          position={nav.position}
          count={nav.count}
          errorCount={nav.errorCount}
          truncated={skipped > 0}
          onPrevious={nav.previous}
          onNext={nav.next}
          onJumpToError={nav.jumpToError}
        />
      )}
      {(status === 'failed' || wasCanceled) && (
        <NoticeBar
          text={wasCanceled ? 'This job was canceled.' : 'This job failed.'}
          actionLabel={wasCanceled ? 'Run again' : 'Retry job'}
          onAction={retryFinishedJob}
        />
      )}
      {status === 'manual' && provider.capabilities.playJob && (
        <NoticeBar text="This job waits for a manual start." actionLabel="Run job" onAction={playManualJob} />
      )}
      {live && status !== 'canceling' && provider.capabilities.cancelJob && <NoticeBar text="This job is running." actionLabel="Cancel job" danger onAction={cancelRunningJob} />}
      {skipped > 0 && (
        <NoticeBar
          text={`Showing the last ${MAX_LOG_LINES} of ${allLines.length} lines`}
          actionLabel="Load full log"
          onAction={() => setShowFull(true)}
        />
      )}
      {log.loading && <LoadingRow label="Loading log" />}
      {log.error !== undefined && log.text === '' && <ErrorView error={log.error} onRetry={log.reload} />}
      <View style={tw`flex-1`}>
        {!log.loading && log.error === undefined && lines.length === 0 && (
          <AppText variant="small" style={tw`p-4`}>
            No output yet.
          </AppText>
        )}
        <LogView
          lines={lines}
          scroll={scroll}
          highlighted={searchOpen ? nav.highlighted : undefined}
          focusLine={searchOpen ? nav.focusLine : undefined}
        />
        {live && !scroll.atBottom && (
          <Button
            label="Scroll to bottom"
            onPress={scroll.scrollToBottom}
            style={tw`absolute bottom-7 right-4 h-12 rounded-full px-5`}
          />
        )}
      </View>
    </Screen>
  );
}
