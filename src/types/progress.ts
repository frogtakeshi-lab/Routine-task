export interface StreakRecord {
  routineId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  totalCompletions: number;
}

export interface DailyAchievement {
  date: string;
  scheduledRoutineCount: number;
  completedRoutineCount: number;
  completedTodoCount: number;
  achievementRate: number;
}

export interface WeeklyStats {
  weekStart: string;
  dailyRates: number[];
  averageRate: number;
}
