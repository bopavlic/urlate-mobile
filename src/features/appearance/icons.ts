import {
  getAppIconName,
  setAlternateAppIcon,
  supportsAlternateIcons,
  type AlternateAppIcons,
} from 'expo-alternate-app-icons';
import { Platform, type ImageSourcePropType } from 'react-native';

import iconList from '../../../assets/icons/icons.json';

import { createIconSwitcher, type IconId } from './switcher';

// The app icon: classic for everyone, the others with Premium. The artwork and list come from
// assets/icons (scripts/icons/generate.mjs); app.config.ts registers the alternates natively.

const PREVIEWS: Record<IconId, ImageSourcePropType> = {
  classic: require('../../../assets/icons/classic-preview.png'),
  concert: require('../../../assets/icons/concert-preview.png'),
  library: require('../../../assets/icons/library-preview.png'),
  parking: require('../../../assets/icons/parking-preview.png'),
  cinema: require('../../../assets/icons/cinema-preview.png'),
  raffle: require('../../../assets/icons/raffle-preview.png'),
};

export const ICONS = iconList.map((icon) => ({
  id: icon.id as IconId,
  label: icon.label,
  preview: PREVIEWS[icon.id as IconId],
}));

export const appIcons = createIconSwitcher({
  platform: Platform.OS,
  set: (name) => setAlternateAppIcon(name as AlternateAppIcons | null),
  get: () => getAppIconName(),
});

export const iconsSupported = supportsAlternateIcons;
