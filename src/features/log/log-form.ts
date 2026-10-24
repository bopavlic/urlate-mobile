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
  /** Group members who weren't there; everyone else (but the late one) waited. */
  absent: string[];
};

export type LogAction =
  | { type: 'pickLedger'; ledgerId: string }
  | { type: 'pickLate'; memberId: string }
  | { type: 'chip'; minutes: number }
  | { type: 'step'; delta: 1 | -1 }
  | { type: 'note'; note: string }
  | { type: 'date'; occurredAt: Date | null }
  | { type: 'toggleAbsent'; memberId: string };

export function initialLogState(ledgerId: string | null): LogState {
  return { ledgerId, lateMemberId: null, minutes: 5, note: '', occurredAt: null, absent: [] };
}

const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value));

export function logReducer(state: LogState, action: LogAction): LogState {
  switch (action.type) {
    case 'pickLedger':
      return { ...state, ledgerId: action.ledgerId, lateMemberId: null, absent: [] };
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
    case 'toggleAbsent':
      return {
        ...state,
        absent: state.absent.includes(action.memberId)
          ? state.absent.filter((id) => id !== action.memberId)
          : [...state.absent, action.memberId],
      };
  }
}

/** Everyone in the ledger who waited: all but the late person and anyone marked absent. */
export function waitersOf(state: LogState, memberIds: readonly string[]): string[] {
  return memberIds.filter((id) => id !== state.lateMemberId && !state.absent.includes(id));
}

/** The request body, or null while the form is incomplete (or nobody waited). */
export function toCreateEntryBody(
  state: LogState,
  clientRequestId: string,
  memberIds: readonly string[] = [],
): CreateEntryBody | null {
  if (!state.ledgerId || !state.lateMemberId) return null;
  const note = state.note.trim();
  const someoneAbsent = state.absent.some((id) => id !== state.lateMemberId);
  const waiters = waitersOf(state, memberIds);
  if (someoneAbsent && waiters.length === 0) return null;
  return {
    lateMemberId: state.lateMemberId,
    // Left out when everyone was there: the API defaults to everyone else.
    ...(someoneAbsent ? { waiterMemberIds: waiters } : {}),
    minutes: state.minutes,
    ...(note ? { note } : {}),
    ...(state.occurredAt ? { occurredAt: state.occurredAt.toISOString() } : {}),
    clientRequestId,
  };
}
