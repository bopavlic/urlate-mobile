import type { FullStatsWorstWeekdayWeekday } from '@/api/generated/model';

export function durationText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function timesText(count: number): string {
  if (count === 1) return 'once';
  if (count === 2) return 'twice';
  return `${count} times`;
}

export function daysText(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/** FRIDAY → "Fridays", as in "most often late on Fridays". */
export function weekdayText(weekday: FullStatsWorstWeekdayWeekday): string {
  return `${weekday.charAt(0)}${weekday.slice(1).toLowerCase()}s`;
}
