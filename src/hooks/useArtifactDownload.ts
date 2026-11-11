import { useState } from 'react';
import { Alert } from 'react-native';
import { describeError } from '../api/errors';
import { useProvider } from '../providers/ProviderContext';
import type { Artifact, ProjectRef } from '../providers/types';
import { errorHaptic } from '../utils/haptics';
import { downloadAndShareArtifact } from '../utils/shareArtifact';

export function useArtifactDownload(project: ProjectRef) {
  const provider = useProvider();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function download(artifact: Artifact) {
    setDownloadingId(artifact.id);
    try {
      await downloadAndShareArtifact(await provider.getArtifactDownload(project, artifact));
    } catch (error) {
      errorHaptic();
      const { title, message } = describeError(error, provider.displayName);
      Alert.alert(title, message);
    } finally {
      setDownloadingId(null);
    }
  }

  return { downloadingId, download };
}
