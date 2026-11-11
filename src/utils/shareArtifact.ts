import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ArtifactDownload } from '../providers/types';

export const zipFileName = (name: string) => `${name.replace(/[^\w.-]+/g, '_')}.zip`;

export async function downloadAndShareArtifact({ url, headers, fileName }: ArtifactDownload) {
  const file = await File.downloadFileAsync(url, new File(Paths.cache, fileName), { headers, idempotent: true });
  await Sharing.shareAsync(file.uri, { mimeType: 'application/zip', dialogTitle: fileName });
}
