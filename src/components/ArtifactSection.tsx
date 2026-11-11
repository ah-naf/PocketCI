import type { Artifact } from '../providers/types';
import { formatBytes } from '../utils/format';
import { ListRow } from './ListRow';
import { SectionHeader } from './SectionHeader';

type Props = { artifacts: Artifact[]; downloadingId: string | null; onDownload: (artifact: Artifact) => void };

export function ArtifactSection({ artifacts, downloadingId, onDownload }: Props) {
  if (artifacts.length === 0) return null;
  return (
    <>
      <SectionHeader title={`Artifacts · ${artifacts.length}`} />
      {artifacts.map((artifact) => (
        <ListRow
          key={artifact.id}
          title={artifact.name}
          subtitle={artifact.jobName ?? undefined}
          tag={downloadingId === artifact.id ? 'Downloading…' : artifact.sizeBytes === null ? undefined : formatBytes(artifact.sizeBytes)}
          accentTag={downloadingId === artifact.id}
          onPress={downloadingId === null ? () => onDownload(artifact) : undefined}
        />
      ))}
    </>
  );
}
