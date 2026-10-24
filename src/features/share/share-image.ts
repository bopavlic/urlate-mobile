import * as Sharing from 'expo-sharing';
import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Story size: 9:16 at 1080 pixels wide. */
export const SHARE_IMAGE_SIZE = { width: 1080, height: 1920 } as const;

/** Captures the card view as a PNG and opens the system share sheet with it. */
export async function shareCardImage(
  view: RefObject<ComponentRef<typeof View> | null>,
  title: string,
): Promise<void> {
  if (!view.current) throw new Error('The card is not on screen yet');
  const uri = await captureRef(view, { format: 'png', result: 'tmpfile', ...SHARE_IMAGE_SIZE });
  // The file stays in the cache folder: apps like Instagram may read it after the sheet closes.
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: title });
}
