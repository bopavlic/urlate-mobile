import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exportMyData } from '@/api/generated/endpoints/me/me';

export type ExportDataDeps = {
  fetchExport: () => Promise<{ exportedAt: string }>;
  /** Writes the file somewhere the share sheet can read; returns its URI. */
  writeFile: (name: string, contents: string) => Promise<string>;
  share: (uri: string) => Promise<void>;
};

export function exportFileName(exportedAt: string): string {
  return `urlate-export-${exportedAt.slice(0, 10)}.json`;
}

/**
 * GDPR access and portability: everything the server keeps about this account as a JSON
 * file, handed to the share sheet so it can go to Files, Drive, email or anywhere else.
 */
export async function exportMyDataFile(deps: ExportDataDeps): Promise<void> {
  const data = await deps.fetchExport();
  // Indented, so the file is readable when opened as text.
  const uri = await deps.writeFile(exportFileName(data.exportedAt), JSON.stringify(data, null, 2));
  await deps.share(uri);
}

export const exportDataDeps: ExportDataDeps = {
  fetchExport: () => exportMyData(),
  async writeFile(name, contents) {
    const file = new File(Paths.cache, name);
    file.create({ overwrite: true });
    await file.write(contents);
    return file.uri;
  },
  async share(uri) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'Your Ur Late data',
    });
  },
};
