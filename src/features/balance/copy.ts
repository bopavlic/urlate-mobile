import type { BalanceView } from '@/api/generated/model';

// One number, one direction (brief: "How the balance works").

export function balanceSentence(view: BalanceView, otherName: string): string {
  if (view.direction === 'THEY_OWE_YOU') return `${otherName} owes you ${view.minutes} min`;
  if (view.direction === 'YOU_OWE_THEM') return `You owe ${otherName} ${view.minutes} min`;
  return 'All square';
}

export function groupBalanceSentence(view: BalanceView): string {
  if (view.direction === 'THEY_OWE_YOU') return `The group owes you ${view.minutes} min`;
  if (view.direction === 'YOU_OWE_THEM') return `You owe the group ${view.minutes} min`;
  return 'All square';
}

export function loggedToast(minutes: number, lateWasMe: boolean): string {
  const unit = minutes === 1 ? 'minute' : 'minutes';
  return lateWasMe
    ? `Noted. ${minutes} ${unit} off your tab… or onto it.`
    : `Noted. ${minutes} more ${unit} on their tab.`;
}
