import { render, screen } from '@testing-library/react-native';

import { BigBalance } from './BigBalance';

describe('BigBalance', () => {
  it('shows the number and the sentence when they owe you', async () => {
    await render(
      <BigBalance
        view={{ direction: 'THEY_OWE_YOU', minutes: 18 }}
        otherName="Brother"
        kind="PAIR"
      />,
    );
    // The numeral is visual; screen readers get the sentence instead.
    expect(screen.getByText('18', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('18')).toBeNull();
    expect(screen.getByText('Brother owes you 18 min')).toBeTruthy();
    expect(screen.queryByText('Enjoy it while it lasts.')).toBeNull();
    expect(screen.getByText('Not that you’re counting.')).toBeTruthy();
  });

  it('cheers you on when all square', async () => {
    await render(
      <BigBalance view={{ direction: 'ALL_SQUARE', minutes: 0 }} otherName="Ana" kind="PAIR" />,
    );
    expect(screen.getByText('0', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('All square')).toBeTruthy();
    expect(screen.getByText('Enjoy it while it lasts.')).toBeTruthy();
  });

  it('talks about the group in group ledgers', async () => {
    await render(
      <BigBalance view={{ direction: 'YOU_OWE_THEM', minutes: 4 }} otherName="" kind="GROUP" />,
    );
    expect(screen.getByText('You owe the group 4 min')).toBeTruthy();
  });
});
