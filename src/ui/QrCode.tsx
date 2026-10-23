import { useMemo } from 'react';
import { View } from 'react-native';

import { darkRuns, qrMatrix } from '@/features/invites/qr';

// Scanners need dark modules on a light background, so this ignores the dark theme.
const QUIET_ZONE = 4;

/** A QR code drawn with plain Views: each row is a few absolutely placed dark bars. */
export function QrCode({
  value,
  size,
  accessibilityLabel,
}: {
  value: string;
  size: number;
  accessibilityLabel: string;
}) {
  const matrix = useMemo(() => qrMatrix(value), [value]);
  const modules = matrix.length + QUIET_ZONE * 2;
  const unit = size / modules;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ width: size, height: size, backgroundColor: '#FFFFFF', borderRadius: unit * 2 }}
    >
      {matrix.map((row, y) =>
        darkRuns(row).map((run) => (
          <View
            key={`${y}-${run.start}`}
            style={{
              position: 'absolute',
              left: (run.start + QUIET_ZONE) * unit,
              top: (y + QUIET_ZONE) * unit,
              // A hair wider and taller so neighbouring bars don't leave seams.
              width: run.length * unit + 0.5,
              height: unit + 0.5,
              backgroundColor: '#000000',
            }}
          />
        )),
      )}
    </View>
  );
}
