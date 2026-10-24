import { balanceSentence, groupBalanceSentence, loggedToast } from './copy';

describe('balanceSentence', () => {
  it('says who owes whom, in one direction', () => {
    expect(balanceSentence({ direction: 'THEY_OWE_YOU', minutes: 18 }, 'Brother')).toBe(
      'Brother owes you 18 min',
    );
    expect(balanceSentence({ direction: 'YOU_OWE_THEM', minutes: 3 }, 'Ana')).toBe(
      'You owe Ana 3 min',
    );
    expect(balanceSentence({ direction: 'ALL_SQUARE', minutes: 0 }, 'Ana')).toBe('All square');
  });
});

describe('groupBalanceSentence', () => {
  it('talks about the group as a whole', () => {
    expect(groupBalanceSentence({ direction: 'THEY_OWE_YOU', minutes: 5 })).toBe(
      'The group owes you 5 min',
    );
    expect(groupBalanceSentence({ direction: 'YOU_OWE_THEM', minutes: 2 })).toBe(
      'You owe the group 2 min',
    );
    expect(groupBalanceSentence({ direction: 'ALL_SQUARE', minutes: 0 })).toBe('All square');
  });
});

describe('loggedToast', () => {
  it('teases the late one', () => {
    expect(loggedToast(2, false)).toBe('Noted. 2 more minutes they owe you.');
    expect(loggedToast(1, false)).toBe('Noted. 1 more minute they owe you.');
    expect(loggedToast(5, true)).toBe('Owned up. 5 minutes on you.');
  });
});
