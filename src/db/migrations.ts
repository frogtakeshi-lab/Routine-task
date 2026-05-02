import { getDb } from './client';

const CURRENT_VERSION = 1;

export function runMigrations(): void {
  const db = getDb();
  const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version;');
  const version = result?.user_version ?? 0;

  if (version >= CURRENT_VERSION) return;

  db.execSync(`
    CREATE TABLE IF NOT EXISTS routines (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      description     TEXT,
      recurrence_type TEXT NOT NULL CHECK(recurrence_type IN ('daily','weekly')),
      week_days       TEXT NOT NULL DEFAULT '[]',
      time_of_day     TEXT,
      color_tag       TEXT NOT NULL DEFAULT '#4F46E5',
      is_active       INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS routine_completions (
      id             TEXT PRIMARY KEY,
      routine_id     TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      completed_date TEXT NOT NULL,
      completed_at   TEXT NOT NULL,
      UNIQUE(routine_id, completed_date)
    );

    CREATE TABLE IF NOT EXISTS todos (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      description  TEXT,
      priority     TEXT NOT NULL CHECK(priority IN ('high','medium','low')),
      deadline     TEXT,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_achievements (
      date                    TEXT PRIMARY KEY,
      scheduled_routine_count INTEGER NOT NULL DEFAULT 0,
      completed_routine_count INTEGER NOT NULL DEFAULT 0,
      completed_todo_count    INTEGER NOT NULL DEFAULT 0,
      achievement_rate        REAL NOT NULL DEFAULT 0
    );

    PRAGMA user_version = ${CURRENT_VERSION};
  `);
}
