import type { CreateEntryBody } from '@/api/generated/model';

const MIN = 1;
const MAX = 1440;

export type LogState = {
  ledgerId: string | null;
  lateMemberId: string | null;
  minutes: number;
  note: string;
  /** null = "just now"; the server stamps the time. */
  occurredAt: Date | null;
};

export type LogAction =
  | { type: 'pickLedger'; ledgerId: string }
  | { type: 'pickLate'; memberId: string }
  | { type: 'chip'; minutes: number }
  | { type: 'step'; delta: 1 | -1 }
  | { type: 'note'; note: string }
  | { type: 'date'; occurredAt: Date | null };

export function initialLogState(ledgerId: string | null): LogState {
  return { ledgerId, lateMemberId: null, minutes: 5, note: '', occurredAt: null };
}

const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

export function logReducer(state: LogState, action: LogAction): LogState {
  switch (action.type) {
    case 'pickLedger':
      return { ...state, ledgerId: action.ledgerId, lateMemberId: null };
    case 'pickLate':
      return { ...state, lateMemberId: action.memberId };
    case 'chip':
      return { ...state, minutes: clamp(action.minutes) };
    case 'step':
      return { ...state, minutes: clamp(state.minutes + action.delta) };
    case 'note':
      return { ...state, note: action.note };
    case 'date':
      return { ...state, occurredAt: action.occurredAt };
  }
}

/** The request body, or null while the form is incomplete. */
export function toCreateEntryBody(
  state: LogState,
  clientRequestId: string,
): CreateEntryBody | null {
  if (!state.ledgerId || !state.lateMemberId) return null;
  const note = state.note.trim();
  return {
    lateMemberId: state.lateMemberId,
    minutes: state.minutes,
    ...(note ? { note } : {}),
    ...(state.occurredAt ? { occurredAt: state.occurredAt.toISOString() } : {}),
    clientRequestId,
  };
}
