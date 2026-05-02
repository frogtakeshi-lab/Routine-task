export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type RecurrenceType = 'daily' | 'weekly';

export interface Routine {
  id: string;
  title: string;
  description?: string;
  recurrenceType: RecurrenceType;
  weekDays: WeekDay[];
  timeOfDay?: string;
  colorTag: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  completedDate: string;
  completedAt: string;
}
