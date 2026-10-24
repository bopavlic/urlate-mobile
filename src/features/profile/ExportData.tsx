import { useState } from 'react';

import { MenuRow } from '@/ui/MenuList';

import { exportDataDeps, exportMyDataFile } from './export-data';

export function ExportData({ onExport = () => exportMyDataFile(exportDataDeps) }) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setExporting(true);
    try {
      await onExport();
    } catch {
      setError("Couldn't get your data. Check your connection and try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <MenuRow
      title="Download my data"
      loading={exporting}
      error={error}
      onPress={() => void run()}
    />
  );
}
