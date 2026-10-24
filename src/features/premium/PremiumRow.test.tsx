import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Entitlements } from '@/api/generated/model';

import { PremiumRow } from './PremiumRow';

const free: Entitlements = {
  premium: false,
  premiumUntil: null,
  premiumStore: null,
  premiumRenews: null,
  features: { shareStyles: false, unlimitedGroups: false, fullStats: false, themes: false },
  rewards: [],
  adsLeftToday: 3,
  groupsCreated: 0,
  groupLimit: 2,
};

describe('PremiumRow', () => {
  it('invites a free account to look at Premium', async () => {
    const onOpen = jest.fn();
    await render(<PremiumRow entitlements={free} onOpen={onOpen} />);
    expect(screen.getByText('Unlimited groups, every card look, no ads.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Get Ur Late Premium' }));
    expect(onOpen).toHaveBeenCalled();
  });

  it('shows a subscriber their status', async () => {
    await render(
      <PremiumRow
        entitlements={{
          ...free,
          premium: true,
          premiumUntil: '2026-11-24T12:00:00.000Z',
          premiumRenews: true,
        }}
        onOpen={jest.fn()}
      />,
    );
    expect(screen.getByText('Renews on 24 November 2026.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ur Late Premium' })).toBeTruthy();
  });
});
