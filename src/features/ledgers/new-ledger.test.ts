import { buildCreateLedgerBody } from './new-ledger';

describe('buildCreateLedgerBody', () => {
  it('builds a pair with one placeholder person', () => {
    expect(buildCreateLedgerBody({ kind: 'PAIR', name: '', people: ['Brother'] })).toEqual({
      kind: 'PAIR',
      members: [{ placeholderName: 'Brother' }],
    });
  });

  it('asks who the pair is with', () => {
    expect(buildCreateLedgerBody({ kind: 'PAIR', name: '', people: ['  '] })).toEqual({
      error: "Who's the late one?",
    });
  });

  it('needs a name for a group', () => {
    expect(buildCreateLedgerBody({ kind: 'GROUP', name: '', people: ['A'] })).toEqual({
      error: 'Give the group a name',
    });
  });

  it('can start a group with just you, to fill through the invite link', () => {
    expect(buildCreateLedgerBody({ kind: 'GROUP', name: 'Football', people: ['', ' '] })).toEqual({
      kind: 'GROUP',
      name: 'Football',
      members: [],
    });
  });

  it('trims and de-duplicates group members', () => {
    expect(
      buildCreateLedgerBody({ kind: 'GROUP', name: ' Football ', people: ['Ana', 'ana', ' Bro '] }),
    ).toEqual({
      kind: 'GROUP',
      name: 'Football',
      members: [{ placeholderName: 'Ana' }, { placeholderName: 'Bro' }],
    });
  });

  it('caps names at 40 characters like the API', () => {
    const long = 'x'.repeat(41);
    expect(buildCreateLedgerBody({ kind: 'PAIR', name: '', people: [long] })).toEqual({
      error: 'Keep names under 40 characters',
    });
  });
});
