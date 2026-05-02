import { getDb } from '../client';
import type { Routine, RoutineCompletion } from '@/types/routine';

function rowToRoutine(row: Record<string, unknown>): Routine {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    recurrenceType: row.recurrence_type as Routine['recurrenceType'],
    weekDays: JSON.parse(row.week_days as string),
    timeOfDay: row.time_of_day as string | undefined,
    colorTag: row.color_tag as string,
    isActive: (row.is_active as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const routineRepo = {
  getAll(): Routine[] {
    const db = getDb();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM routines ORDER BY created_at ASC;'
    );
    return rows.map(rowToRoutine);
  },

  getById(id: string): Routine | null {
    const db = getDb();
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM routines WHERE id = ?;',
      [id]
    );
    return row ? rowToRoutine(row) : null;
  },

  insert(routine: Routine): void {
    const db = getDb();
    db.runSync(
      `INSERT INTO routines
        (id,title,description,recurrence_type,week_days,time_of_day,color_tag,is_active,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?);`,
      [
        routine.id,
        routine.title,
        routine.description ?? null,
        routine.recurrenceType,
        JSON.stringify(routine.weekDays),
        routine.timeOfDay ?? null,
        routine.colorTag,
        routine.isActive ? 1 : 0,
        routine.createdAt,
        routine.updatedAt,
      ]
    );
  },

  update(id: string, data: Partial<Omit<Routine, 'id' | 'createdAt'>>): void {
    const db = getDb();
    const updatedAt = new Date().toISOString();
    db.runSync(
      `UPDATE routines SET
        title=COALESCE(?,title),
        description=?,
        recurrence_type=COALESCE(?,recurrence_type),
        week_days=COALESCE(?,week_days),
        time_of_day=?,
        color_tag=COALESCE(?,color_tag),
        is_active=COALESCE(?,is_active),
        updated_at=?
      WHERE id=?;`,
      [
        data.title ?? null,
        data.description !== undefined ? (data.description ?? null) : null,
        data.recurrenceType ?? null,
        data.weekDays ? JSON.stringify(data.weekDays) : null,
        data.timeOfDay !== undefined ? (data.timeOfDay ?? null) : null,
        data.colorTag ?? null,
        data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
        updatedAt,
        id,
      ]
    );
  },

  delete(id: string): void {
    const db = getDb();
    db.runSync('DELETE FROM routines WHERE id = ?;', [id]);
  },

  getCompletionsForRange(start: string, end: string): RoutineCompletion[] {
    const db = getDb();
    const rows = db.getAllSync<Record<string, unknown>>(
      `SELECT * FROM routine_completions
       WHERE completed_date >= ? AND completed_date <= ?
       ORDER BY completed_date ASC;`,
      [start, end]
    );
    return rows.map((r) => ({
      id: r.id as string,
      routineId: r.routine_id as string,
      completedDate: r.completed_date as string,
      completedAt: r.completed_at as string,
    }));
  },

  upsertCompletion(completion: RoutineCompletion): void {
    const db = getDb();
    db.runSync(
      `INSERT OR REPLACE INTO routine_completions (id,routine_id,completed_date,completed_at)
       VALUES (?,?,?,?);`,
      [completion.id, completion.routineId, completion.completedDate, completion.completedAt]
    );
  },

  deleteCompletion(routineId: string, completedDate: string): void {
    const db = getDb();
    db.runSync(
      'DELETE FROM routine_completions WHERE routine_id=? AND completed_date=?;',
      [routineId, completedDate]
    );
  },

  getCompletionsForRoutine(routineId: string): RoutineCompletion[] {
    const db = getDb();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM routine_completions WHERE routine_id=? ORDER BY completed_date DESC;',
      [routineId]
    );
    return rows.map((r) => ({
      id: r.id as string,
      routineId: r.routine_id as string,
      completedDate: r.completed_date as string,
      completedAt: r.completed_at as string,
    }));
  },
};
