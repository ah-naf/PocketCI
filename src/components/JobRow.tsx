import { Pressable } from 'react-native';
import type { Job } from '../api/pipelines';
import { useTheme } from '../theme';
import { formatJobDuration } from '../utils/format';
import { AppText } from './AppText';
import { JobStatusIcon } from './JobStatusIcon';
import { StatusBadge } from './StatusBadge';

type Props = { job: Job; now: number; onPress: () => void };

const WAITING_STATUSES = ['created', 'pending', 'waiting_for_resource'];

export function JobRow({ job, now, onPress }: Props) {
  const { tw, colors } = useTheme();
  const waiting = WAITING_STATUSES.includes(job.status);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: colors.raised }}
      style={tw`min-h-[52px] flex-row items-center gap-3 border-b border-line py-2 pl-1 pr-3`}
    >
      <JobStatusIcon status={job.status} />
      <AppText
        mono
        tone={waiting ? 'muted' : 'fg'}
        numberOfLines={1}
        style={tw`flex-1 text-sm`}
      >
        {job.name}
      </AppText>
      {job.status === 'manual' ? (
        <StatusBadge status="manual" />
      ) : (
        <AppText
          variant="caption"
          mono
          tone={job.status === 'running' ? 'running' : waiting ? 'dim' : 'muted'}
          style={tw`text-xs`}
        >
          {waiting ? 'pending' : formatJobDuration(job, now)}
        </AppText>
      )}
      <AppText variant="heading" tone="dim">
        ›
      </AppText>
    </Pressable>
  );
}
