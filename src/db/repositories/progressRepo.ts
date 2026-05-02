import { getDb } from '../client';
import type { DailyAchievement, StreakRecord } from '@/types/progress';

export const progressRepo = {
  getDailyAchievement(date: string): DailyAchievement | null {
    const db = getDb();
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM daily_achievements WHERE date = ?;',
      [date]
    );
    if (!row) return null;
    return {
      date: row.date as string,
      scheduledRoutineCount: row.scheduled_routine_count as number,
      completedRoutineCount: row.completed_routine_count as number,
      completedTodoCount: row.completed_todo_count as number,
      achievementRate: row.achievement_rate as number,
    };
  },

  upsertDailyAchievement(achievement: DailyAchievement): void {
    const db = getDb();
    db.runSync(
      `INSERT OR REPLACE INTO daily_achievements
        (date,scheduled_routine_count,completed_routine_count,completed_todo_count,achievement_rate)
        VALUES (?,?,?,?,?);`,
      [
        achievement.date,
        achievement.scheduledRoutineCount,
        achievement.completedRoutineCount,
        achievement.completedTodoCount,
        achievement.achievementRate,
      ]
    );
  },

  getRange(start: string, end: string): DailyAchievement[] {
    const db = getDb();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM daily_achievements WHERE date >= ? AND date <= ? ORDER BY date ASC;',
      [start, end]
    );
    return rows.map((r) => ({
      date: r.date as string,
      scheduledRoutineCount: r.scheduled_routine_count as number,
      completedRoutineCount: r.completed_routine_count as number,
      completedTodoCount: r.completed_todo_count as number,
      achievementRate: r.achievement_rate as number,
    }));
  },
};

export const streakCache = new Map<string, StreakRecord>();
