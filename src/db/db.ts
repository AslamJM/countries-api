import { Database } from "bun:sqlite";

export const db = new Database("sqlite.db")
db.run(`
    CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL DEFAULT 0 CHECK (isAdmin IN (0, 1))
);`)
db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
    key TEXT PRIMARY KEY,
    expiryAt DATETIME NOT NULL,
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
`)

db.run(`
      CREATE TABLE IF NOT EXISTS usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL,
        time DATETIME NOT NULL 
      )  
    `)
