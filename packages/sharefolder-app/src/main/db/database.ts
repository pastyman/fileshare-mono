const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// TypeScript interfaces for type checking
interface FolderEntry {
  id?: number;
  guid: string;
  path: string;
  createdAt: number;
  isLive?: boolean;
  isPasswordProtected?: boolean;
}

interface UserEntry {
  id?: number;
  email: string;
  fullName: string;
  password: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface InstanceEntry {
  id?: number;
  guid: string;
  createdAt: number;
  updatedAt: number;
}

// SQLite callback types
type SQLiteCallback = (err: Error | null) => void;
type SQLiteGetCallback = (err: Error | null, row: any) => void;
type SQLiteAllCallback = (err: Error | null, rows: any[]) => void;

class Database {
  private db: any = null;
  private dbPath: string;

  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'sharefolder.db');
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }

        // Enable foreign keys
        this.db!.run('PRAGMA foreign_keys = ON', (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }

          // Create tables
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        });
      });
    });
  }

  private async createTables(): Promise<void> {
    const createFoldersTable = `
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT UNIQUE NOT NULL,
        path TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        isLive INTEGER DEFAULT 1,
        isPasswordProtected INTEGER DEFAULT 0
      )
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        fullName TEXT NOT NULL,
        password TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `;

    const createInstanceTable = `
      CREATE TABLE IF NOT EXISTS instance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT UNIQUE NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `;

    const createConnectionEventsTable = `
      CREATE TABLE IF NOT EXISTS connection_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        peerId TEXT NOT NULL,
        folderId TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `;

    const createDownloadEventsTable = `
      CREATE TABLE IF NOT EXISTS download_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folderId TEXT NOT NULL,
        relativePath TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `;

    const createPreviewEventsTable = `
      CREATE TABLE IF NOT EXISTS preview_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folderId TEXT NOT NULL,
        relativePath TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `;

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.serialize(() => {
        this.db!.run(createFoldersTable, (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db!.run(createUsersTable, (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db!.run(createInstanceTable, (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db!.run(createConnectionEventsTable, (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db!.run(createDownloadEventsTable, (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db!.run(createPreviewEventsTable, (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          this.migrateUsersDropUsername()
            .then(() => resolve())
            .catch(reject);
        });
      });
    });
  }

  /** Drop legacy username column from existing installs. */
  private async migrateUsersDropUsername(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all('PRAGMA table_info(users)', (err: Error | null, columns: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const hasUsername = (columns || []).some((col) => col.name === 'username');
        if (!hasUsername) {
          resolve();
          return;
        }

        this.db!.serialize(() => {
          this.db!.run('BEGIN TRANSACTION');
          this.db!.run(`
            CREATE TABLE users_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              fullName TEXT NOT NULL,
              password TEXT NOT NULL,
              isActive INTEGER DEFAULT 1,
              createdAt INTEGER NOT NULL,
              updatedAt INTEGER NOT NULL
            )
          `);
          this.db!.run(`
            INSERT INTO users_new (id, email, fullName, password, isActive, createdAt, updatedAt)
            SELECT id, email, fullName, password, isActive, createdAt, updatedAt FROM users
          `);
          this.db!.run('DROP TABLE users');
          this.db!.run('ALTER TABLE users_new RENAME TO users', (renameErr: Error | null) => {
            if (renameErr) {
              this.db!.run('ROLLBACK');
              reject(renameErr);
              return;
            }
            this.db!.run('COMMIT', (commitErr: Error | null) => {
              if (commitErr) reject(commitErr);
              else resolve();
            });
          });
        });
      });
    });
  }

  private mapUserRow(row: any): UserEntry {
    return {
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      password: row.password,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Instance management
  async getOrCreateInstance(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get('SELECT guid FROM instance LIMIT 1', (err: Error | null, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (row) {
          resolve(row.guid);
        } else {
          // Create new instance
          const guid = this.generateGuid();
          const now = Date.now();
          
          this.db!.run(
            'INSERT INTO instance (guid, createdAt, updatedAt) VALUES (?, ?, ?)',
            [guid, now, now],
            (err: Error | null) => {
              if (err) {
                reject(err);
              } else {
                resolve(guid);
              }
            }
          );
        }
      });
    });
  }

  // User CRUD operations
  async listUsers(): Promise<UserEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(
        'SELECT id, email, fullName, password, isActive, createdAt, updatedAt FROM users ORDER BY createdAt DESC',
        (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row: any) => this.mapUserRow(row)));
          }
        }
      );
    });
  }

  async addUser(userData: Omit<UserEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const now = Date.now();
      this.db.run(
        'INSERT INTO users (email, fullName, password, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.email, userData.fullName, userData.password, userData.isActive ? 1 : 0, now, now],
        function(err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async updateUser(id: number, updates: Partial<Omit<UserEntry, 'id' | 'createdAt'>>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const allowed = new Set(['email', 'fullName', 'password', 'isActive']);
      const fields = Object.keys(updates).filter((key) => allowed.has(key));
      if (fields.length === 0) {
        resolve();
        return;
      }
      const values = fields.map(field => updates[field as keyof typeof updates]);
      values.push(Date.now()); // updatedAt
      values.push(id);

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ?`;

      this.db.run(query, values, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async removeUser(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM users WHERE id = ?', [id], (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getUserById(id: number): Promise<UserEntry | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(
        'SELECT id, email, fullName, password, isActive, createdAt, updatedAt FROM users WHERE id = ?',
        [id],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(this.mapUserRow(row));
          } else {
            resolve(undefined);
          }
        }
      );
    });
  }

  /** Verify an active user by email + password. Returns identity without the password. */
  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ id: number; email: string; fullName: string } | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        resolve(null);
        return;
      }

      this.db.get(
        `SELECT id, email, fullName, password, isActive
         FROM users
         WHERE lower(email) = ? AND isActive = 1`,
        [normalized],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row || row.password !== password) {
            resolve(null);
            return;
          }
          resolve({
            id: row.id,
            email: row.email,
            fullName: row.fullName,
          });
        }
      );
    });
  }

  // Folder CRUD operations
  async listFolders(): Promise<FolderEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(
        'SELECT * FROM folders ORDER BY createdAt DESC',
        (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row: any) => ({
              ...row,
              isLive: Boolean(row.isLive),
              isPasswordProtected: Boolean(row.isPasswordProtected)
            })));
          }
        }
      );
    });
  }

  async addFolder(path: string, guid?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const g = guid ?? this.generateGuid();
      const now = Date.now();

      this.db.run(
        'INSERT INTO folders (guid, path, createdAt, isLive, isPasswordProtected) VALUES (?, ?, ?, ?, ?)',
        [g, path, now, 1, 0],
        function(err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async removeFolder(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM folders WHERE id = ?', [id], (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async updateFolderProperties(
    id: number,
    updates: Partial<Pick<FolderEntry, 'isLive' | 'isPasswordProtected'>>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const fields = Object.keys(updates);
      const values: (string | number)[] = fields.map(field => {
        const value = updates[field as keyof typeof updates];
        return typeof value === 'boolean' ? (value ? 1 : 0) : value;
      });
      values.push(id);

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE folders SET ${setClause} WHERE id = ?`;

      this.db.run(query, values, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getFolderByGuid(guid: string): Promise<FolderEntry | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get('SELECT * FROM folders WHERE guid = ?', [guid], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // Debug function
  async debugDatabase(): Promise<any> {
    try {
      const folderCount = await this.listFolders();
      const userCount = await this.listUsers();
      const instance = await this.getOrCreateInstance();
      
      return {
        folderCount: folderCount.length,
        userCount: userCount.length,
        instanceGuid: instance,
        dbPath: this.dbPath
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async recordConnectionEvent(peerId: string, folderId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      this.db.run(
        'INSERT INTO connection_events (peerId, folderId, createdAt) VALUES (?, ?, ?)',
        [peerId, folderId, Date.now()],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async recordDownloadEvent(
    folderId: string,
    relativePath: string,
    bytes: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      this.db.run(
        'INSERT INTO download_events (folderId, relativePath, bytes, createdAt) VALUES (?, ?, ?, ?)',
        [folderId, relativePath, Math.max(0, Math.floor(bytes)), Date.now()],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async recordPreviewEvent(
    folderId: string,
    relativePath: string,
    bytes: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      this.db.run(
        'INSERT INTO preview_events (folderId, relativePath, bytes, createdAt) VALUES (?, ?, ?, ?)',
        [folderId, relativePath, Math.max(0, Math.floor(bytes)), Date.now()],
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getStatsSummary(days = 14): Promise<{
    folders: { total: number; live: number; passwordProtected: number };
    users: { total: number; active: number };
    connections7d: number;
    downloads7d: number;
    bytes7d: number;
    previews7d: number;
    previewBytes7d: number;
    connectionsByDay: Array<{ date: string; count: number }>;
    downloadsByDay: Array<{ date: string; count: number; bytes: number }>;
    previewsByDay: Array<{ date: string; count: number; bytes: number }>;
  }> {
    const folders = await this.listFolders();
    const users = await this.listUsers();
    const dayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const start14 = now - days * dayMs;
    const start7 = now - 7 * dayMs;

    const dayKeys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      dayKeys.push(d.toISOString().slice(0, 10));
    }

    const connections = await this.queryAll<{ createdAt: number }>(
      'SELECT createdAt FROM connection_events WHERE createdAt >= ?',
      [start14]
    );
    const downloads = await this.queryAll<{ createdAt: number; bytes: number }>(
      'SELECT createdAt, bytes FROM download_events WHERE createdAt >= ?',
      [start14]
    );
    const previews = await this.queryAll<{ createdAt: number; bytes: number }>(
      'SELECT createdAt, bytes FROM preview_events WHERE createdAt >= ?',
      [start14]
    );

    const connMap = new Map(dayKeys.map((k) => [k, 0]));
    const dlCountMap = new Map(dayKeys.map((k) => [k, 0]));
    const dlBytesMap = new Map(dayKeys.map((k) => [k, 0]));
    const pvCountMap = new Map(dayKeys.map((k) => [k, 0]));
    const pvBytesMap = new Map(dayKeys.map((k) => [k, 0]));

    let connections7d = 0;
    let downloads7d = 0;
    let bytes7d = 0;
    let previews7d = 0;
    let previewBytes7d = 0;

    for (const row of connections) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      if (connMap.has(key)) connMap.set(key, (connMap.get(key) || 0) + 1);
      if (row.createdAt >= start7) connections7d += 1;
    }

    for (const row of downloads) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      if (dlCountMap.has(key)) {
        dlCountMap.set(key, (dlCountMap.get(key) || 0) + 1);
        dlBytesMap.set(key, (dlBytesMap.get(key) || 0) + (row.bytes || 0));
      }
      if (row.createdAt >= start7) {
        downloads7d += 1;
        bytes7d += row.bytes || 0;
      }
    }

    for (const row of previews) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      if (pvCountMap.has(key)) {
        pvCountMap.set(key, (pvCountMap.get(key) || 0) + 1);
        pvBytesMap.set(key, (pvBytesMap.get(key) || 0) + (row.bytes || 0));
      }
      if (row.createdAt >= start7) {
        previews7d += 1;
        previewBytes7d += row.bytes || 0;
      }
    }

    return {
      folders: {
        total: folders.length,
        live: folders.filter((f) => f.isLive).length,
        passwordProtected: folders.filter((f) => f.isPasswordProtected).length,
      },
      users: {
        total: users.length,
        active: users.filter((u) => u.isActive).length,
      },
      connections7d,
      downloads7d,
      bytes7d,
      previews7d,
      previewBytes7d,
      connectionsByDay: dayKeys.map((date) => ({
        date,
        count: connMap.get(date) || 0,
      })),
      downloadsByDay: dayKeys.map((date) => ({
        date,
        count: dlCountMap.get(date) || 0,
        bytes: dlBytesMap.get(date) || 0,
      })),
      previewsByDay: dayKeys.map((date) => ({
        date,
        count: pvCountMap.get(date) || 0,
        bytes: pvBytesMap.get(date) || 0,
      })),
    };
  }

  async getRecentActivity(limit = 50): Promise<
    Array<{
      type: 'connection' | 'download' | 'preview';
      detail: string;
      folderId: string;
      bytes: number;
      createdAt: number;
    }>
  > {
    const rows = await this.queryAll<{
      type: string;
      detail: string;
      folderId: string;
      bytes: number;
      createdAt: number;
    }>(
      `
      SELECT type, detail, folderId, bytes, createdAt FROM (
        SELECT 'connection' AS type, peerId AS detail, folderId, 0 AS bytes, createdAt
        FROM connection_events
        UNION ALL
        SELECT 'download' AS type, relativePath AS detail, folderId, bytes, createdAt
        FROM download_events
        UNION ALL
        SELECT 'preview' AS type, relativePath AS detail, folderId, bytes, createdAt
        FROM preview_events
      )
      ORDER BY createdAt DESC
      LIMIT ?
      `,
      [limit]
    );
    return rows.map((row) => ({
      type: row.type as 'connection' | 'download' | 'preview',
      detail: row.detail,
      folderId: row.folderId,
      bytes: Number(row.bytes) || 0,
      createdAt: row.createdAt,
    }));
  }

  private queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      this.db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve((rows || []) as T[]);
      });
    });
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { database: new Database() };
