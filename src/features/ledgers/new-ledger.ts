import type { CreateLedgerBody } from '@/api/generated/model';

const MAX_NAME = 40;
const MAX_GROUP_PEOPLE = 49;

export type NewLedgerForm = { kind: 'PAIR' | 'GROUP'; name: string; people: string[] };

/** Turns the form into the API body, or explains what's missing in the app's voice. */
export function buildCreateLedgerBody(form: NewLedgerForm): CreateLedgerBody | { error: string } {
  const seen = new Set<string>();
  const people = form.people
    .map((person) => person.trim())
    .filter((person) => {
      const key = person.toLocaleLowerCase();
      if (!person || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const name = form.name.trim();
  if ([name, ...people].some((value) => value.length > MAX_NAME)) {
    return { error: `Keep names under ${MAX_NAME} characters` };
  }

  if (form.kind === 'PAIR') {
    const [person] = people;
    if (!person) return { error: "Who's the late one?" };
    return { kind: 'PAIR', members: [{ placeholderName: person }] };
  }

  if (!name) return { error: 'Give the group a name' };
  if (people.length > MAX_GROUP_PEOPLE) return { error: 'A group holds up to 50 people' };
  return {
    kind: 'GROUP',
    name,
    members: people.map((placeholderName) => ({ placeholderName })),
  };
}
