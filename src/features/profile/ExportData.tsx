import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/ui/Button';

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
    <View className="gap-2">
      <Button
        title="Download my data"
        variant="ghost"
        loading={exporting}
        onPress={() => void run()}
      />
      {error ? <Text className="text-base text-danger">{error}</Text> : null}
    </View>
  );
}
