import { getDay } from 'date-fns';
import type { Routine } from '@/types/routine';

export function isScheduledOn(routine: Routine, date: Date): boolean {
  if (!routine.isActive) return false;
  if (routine.recurrenceType === 'daily') return true;
  return routine.weekDays.includes(getDay(date) as Routine['weekDays'][number]);
}
