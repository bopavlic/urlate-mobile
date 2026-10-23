import { render, screen } from '@testing-library/react-native';

import { groupLedger, pairLedger } from './fixtures';
import { ledgerTitle, LedgerRow } from './LedgerRow';

describe('LedgerRow', () => {
  it('shows the other person and the balance for a pair', async () => {
    await render(<LedgerRow ledger={pairLedger()} onPress={jest.fn()} />);
    expect(screen.getByText('Brother')).toBeTruthy();
    expect(screen.getByText('Brother owes you 18 min')).toBeTruthy();
  });

  it('shows the group name and the group balance', async () => {
    await render(<LedgerRow ledger={groupLedger()} onPress={jest.fn()} />);
    expect(screen.getByText('Football')).toBeTruthy();
    expect(screen.getByText('You owe the group 2 min')).toBeTruthy();
  });

  it('says all square without a number', async () => {
    await render(
      <LedgerRow
        ledger={pairLedger({ myBalance: { direction: 'ALL_SQUARE', minutes: 0 } })}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('All square')).toBeTruthy();
  });
});

describe('ledgerTitle', () => {
  it('uses a pair ledger’s own name when it has one', () => {
    expect(ledgerTitle(pairLedger({ name: 'Football lifts' }))).toBe('Football lifts');
    expect(ledgerTitle(pairLedger())).toBe('Brother');
  });
});
