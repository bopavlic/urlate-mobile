import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Stats } from '@/api/generated/model';

import { StatsScreen } from './StatsScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const totals = { lateMinutes: 45, lateCount: 7, waitedMinutes: 192, waitedCount: 12 };
const full = {
  averageLateMinutes: 6,
  averageWaitMinutes: 16,
  worstWeekday: { weekday: 'FRIDAY' as const, lateCount: 3 },
  longestOnTimeStreakDays: 23,
  currentOnTimeStreakDays: 4,
  keepsYouWaiting: [{ name: 'Brother', minutes: 120, count: 6 }],
  youKeepWaiting: [{ name: 'Ana', minutes: 30, count: 2 }],
};

const base = {
  loading: false,
  error: false,
  onRetry: jest.fn(),
  onGetPremium: jest.fn(),
  adOffer: { show: true, label: 'Watch an ad: unlock for 24 hours', disabled: false, note: '' },
  adState: 'idle' as const,
  onWatchAd: jest.fn(),
};

it('shows everyone their totals, and Premium the rest behind a choice', async () => {
  const onGetPremium = jest.fn();
  const stats: Stats = { totals, full: null };
  await render(<StatsScreen {...base} stats={stats} onGetPremium={onGetPremium} />);
  expect(screen.getByText('3 h 12 min')).toBeTruthy();
  expect(screen.getByText('Waited for others, 12 times')).toBeTruthy();
  expect(screen.getByText('45 min')).toBeTruthy();
  expect(screen.queryByText(/Fridays/)).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Get Premium' }));
  expect(onGetPremium).toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Watch an ad: unlock for 24 hours' })).toBeTruthy();
});

it('shows the full stats once unlocked', async () => {
  await render(<StatsScreen {...base} stats={{ totals, full }} />);
  expect(screen.getByText('Most often late on Fridays (3 times)')).toBeTruthy();
  expect(screen.getByText('23 days')).toBeTruthy();
  expect(screen.getByText('Brother')).toBeTruthy();
  expect(screen.getByText('2 h, 6 times')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Get Premium' })).toBeNull();
});

it('has a kind word before anyone was late', async () => {
  await render(
    <StatsScreen
      {...base}
      stats={{
        totals: { lateMinutes: 0, lateCount: 0, waitedMinutes: 0, waitedCount: 0 },
        full: { ...full, worstWeekday: null, keepsYouWaiting: [], youKeepWaiting: [] },
      }}
    />,
  );
  expect(screen.getByText('Never late. Keep it that way.')).toBeTruthy();
});
