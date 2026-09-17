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
  username: string;
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
        isLive INTEGER DEFAULT 0,
        isPasswordProtected INTEGER DEFAULT 0
      )
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
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

        resolve();
      });
    });
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
        'SELECT * FROM users ORDER BY createdAt DESC',
        (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row: any) => ({
              ...row,
              isActive: Boolean(row.isActive)
            })));
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
        'INSERT INTO users (username, email, fullName, password, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userData.username, userData.email, userData.fullName, userData.password, userData.isActive ? 1 : 0, now, now],
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

      const fields = Object.keys(updates).filter(key => key !== 'id');
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

      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            ...row,
            isActive: Boolean(row.isActive)
          });
        } else {
          resolve(undefined);
        }
      });
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
        [g, path, now, 0, 0],
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

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { database: new Database() };
