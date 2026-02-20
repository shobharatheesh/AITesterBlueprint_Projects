import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
    if (db) return db;

    const dbPath = path.join(__dirname, '../../data/app.db');
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    return db;
}

export async function setSetting(key: string, value: string) {
    const database = await getDb();
    await database.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        key,
        value
    );
}

export async function getSetting(key: string): Promise<string | null> {
    const database = await getDb();
    const result = await database.get('SELECT value FROM settings WHERE key = ?', key);
    return result ? result.value : null;
}
