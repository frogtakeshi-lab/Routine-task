import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('routine_app.db');
    db.execSync('PRAGMA journal_mode = WAL;');
    db.execSync('PRAGMA foreign_keys = ON;');
  }
  return db;
}
