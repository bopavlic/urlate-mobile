import type { Entry, UpdateEntryBody } from '@/api/generated/model';

export type EditState = { minutes: number; note: string; occurredAt: Date };

export function initialEditState(entry: Entry): EditState {
  return { minutes: entry.minutes, note: entry.note ?? '', occurredAt: new Date(entry.occurredAt) };
}

/** Only the fields that changed, or null when saving would change nothing. */
export function toUpdateEntryBody(entry: Entry, state: EditState): UpdateEntryBody | null {
  const body: UpdateEntryBody = {};
  if (state.minutes !== entry.minutes) body.minutes = state.minutes;
  const note = state.note.trim();
  if (note !== (entry.note ?? '')) body.note = note || null;
  if (state.occurredAt.getTime() !== Date.parse(entry.occurredAt)) {
    body.occurredAt = state.occurredAt.toISOString();
  }
  return Object.keys(body).length ? body : null;
}
