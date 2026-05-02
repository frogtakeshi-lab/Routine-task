import { subDays, format } from 'date-fns';
import { isScheduledOn } from './recurrence';
import type { Routine } from '@/types/routine';

export function calculateStreak(
  routine: Routine,
  completionDates: Set<string>,
  referenceDate: Date = new Date()
): number {
  const today = referenceDate;
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayScheduled = isScheduledOn(routine, today);

  let cursor = (todayScheduled && !completionDates.has(todayStr))
    ? subDays(today, 1)
    : today;

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    if (!isScheduledOn(routine, cursor)) {
      cursor = subDays(cursor, 1);
      continue;
    }
    const dateStr = format(cursor, 'yyyy-MM-dd');
    if (completionDates.has(dateStr)) {
      streak++;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calculateLongestStreak(
  routine: Routine,
  completionDates: Set<string>
): number {
  const sorted = Array.from(completionDates).sort();
  if (sorted.length === 0) return 0;

  let longest = 0;
  let current = 0;
  let cursor: Date | null = null;

  for (const dateStr of sorted) {
    const date = new Date(dateStr + 'T00:00:00');
    if (!isScheduledOn(routine, date)) continue;

    if (cursor === null) {
      current = 1;
      cursor = date;
    } else {
      let prev = subDays(date, 1);
      while (!isScheduledOn(routine, prev) && prev > cursor!) {
        prev = subDays(prev, 1);
      }
      if (format(prev, 'yyyy-MM-dd') === format(cursor, 'yyyy-MM-dd')) {
        current++;
      } else {
        current = 1;
      }
      cursor = date;
    }
    if (current > longest) longest = current;
  }
  return longest;
}
