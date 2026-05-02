import { getDb } from '../client';
import type { Todo } from '@/types/todo';

function rowToTodo(row: Record<string, unknown>): Todo {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    priority: row.priority as Todo['priority'],
    deadline: row.deadline as string | undefined,
    isCompleted: (row.is_completed as number) === 1,
    completedAt: row.completed_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const todoRepo = {
  getAll(): Todo[] {
    const db = getDb();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM todos ORDER BY created_at DESC;'
    );
    return rows.map(rowToTodo);
  },

  getById(id: string): Todo | null {
    const db = getDb();
    const row = db.getFirstSync<Record<string, unknown>>(
      'SELECT * FROM todos WHERE id = ?;',
      [id]
    );
    return row ? rowToTodo(row) : null;
  },

  insert(todo: Todo): void {
    const db = getDb();
    db.runSync(
      `INSERT INTO todos
        (id,title,description,priority,deadline,is_completed,completed_at,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?);`,
      [
        todo.id,
        todo.title,
        todo.description ?? null,
        todo.priority,
        todo.deadline ?? null,
        todo.isCompleted ? 1 : 0,
        todo.completedAt ?? null,
        todo.createdAt,
        todo.updatedAt,
      ]
    );
  },

  update(id: string, data: Partial<Omit<Todo, 'id' | 'createdAt'>>): void {
    const db = getDb();
    const updatedAt = new Date().toISOString();
    const todo = todoRepo.getById(id);
    if (!todo) return;
    const merged = { ...todo, ...data, updatedAt };
    db.runSync(
      `UPDATE todos SET
        title=?,description=?,priority=?,deadline=?,is_completed=?,completed_at=?,updated_at=?
       WHERE id=?;`,
      [
        merged.title,
        merged.description ?? null,
        merged.priority,
        merged.deadline ?? null,
        merged.isCompleted ? 1 : 0,
        merged.completedAt ?? null,
        merged.updatedAt,
        id,
      ]
    );
  },

  delete(id: string): void {
    const db = getDb();
    db.runSync('DELETE FROM todos WHERE id = ?;', [id]);
  },

  getByDeadlineRange(start: string, end: string): Todo[] {
    const db = getDb();
    const rows = db.getAllSync<Record<string, unknown>>(
      'SELECT * FROM todos WHERE deadline >= ? AND deadline <= ? ORDER BY deadline ASC;',
      [start, end]
    );
    return rows.map(rowToTodo);
  },
};
