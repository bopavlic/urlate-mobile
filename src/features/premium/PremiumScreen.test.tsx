import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Entitlements } from '@/api/generated/model';

import type { Plan } from './plans';
import { PremiumScreen } from './PremiumScreen';

jest.mock(
  'react-native-safe-area-context',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const free: Entitlements = {
  premium: false,
  premiumUntil: null,
  premiumStore: null,
  premiumRenews: null,
  features: { shareStyles: false, unlimitedGroups: false, fullStats: false, themes: false },
  rewards: [],
  adsLeftToday: 3,
  groupsCreated: 2,
  groupLimit: 2,
};

const plans: Plan[] = [
  {
    sku: 'app.urlate.premium.yearly',
    period: 'year',
    price: '$19.99',
    amount: 19.99,
    offerToken: null,
  },
  {
    sku: 'app.urlate.premium.monthly',
    period: 'month',
    price: '$2.99',
    amount: 2.99,
    offerToken: null,
  },
];

function setup(overrides: Partial<Parameters<typeof PremiumScreen>[0]> = {}) {
  const props = {
    entitlements: free,
    plans,
    plansError: false,
    busy: null,
    message: null,
    onBuy: jest.fn(),
    onRestore: jest.fn(),
    onManage: jest.fn(),
    onOpenLink: jest.fn(),
    ...overrides,
  };
  return { props, view: render(<PremiumScreen {...props} />) };
}

describe('PremiumScreen', () => {
  it('sells the yearly and monthly plans at store prices', async () => {
    const { props, view } = setup();
    await view;
    expect(screen.getByText('Unlimited groups')).toBeTruthy();
    expect(screen.getByText('Save 44%')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Yearly, $19.99 a year' }));
    expect(props.onBuy).toHaveBeenCalledWith(plans[0]);
    await fireEvent.press(screen.getByRole('button', { name: 'Monthly, $2.99 a month' }));
    expect(props.onBuy).toHaveBeenCalledWith(plans[1]);
  });

  it('shows the renewal terms and links the store rules ask for', async () => {
    const { props, view } = setup();
    await view;
    expect(screen.getByText(/Renews automatically until you cancel/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Restore purchases' }));
    expect(props.onRestore).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('link', { name: 'Terms' }));
    expect(props.onOpenLink).toHaveBeenCalledWith('/terms');
    await fireEvent.press(screen.getByRole('link', { name: 'Privacy' }));
    expect(props.onOpenLink).toHaveBeenCalledWith('/privacy');
  });

  it('lets a subscriber manage it in their store instead', async () => {
    const { props, view } = setup({
      entitlements: {
        ...free,
        premium: true,
        premiumUntil: '2026-11-24T12:00:00.000Z',
        premiumStore: 'APPLE',
        premiumRenews: true,
      },
    });
    await view;
    expect(screen.getByText('You’re on Premium.')).toBeTruthy();
    expect(screen.getByText('Renews on 24 November 2026.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Yearly/ })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Manage in the App Store' }));
    expect(props.onManage).toHaveBeenCalled();
  });

  it('says when the store has no prices to show', async () => {
    const { view } = setup({ plans: undefined, plansError: true });
    await view;
    expect(
      screen.getByText('Couldn’t load prices from the store. Check your connection and try again.'),
    ).toBeTruthy();
  });
});
