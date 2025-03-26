import { MCPServer, Lead, Interaction } from "../../types";
import { Database } from "sqlite3";

export class DatabaseMCPServer implements MCPServer {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    this.db = new Database("domain_prospector.db");
    await this.setupTables();
  }

  async cleanup(): Promise<void> {
    if (this.db) {
      await new Promise<void>((resolve, reject) => {
        this.db?.close((err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
      this.db = null;
    }
  }

  private async setupTables(): Promise<void> {
    if (!this.db) return;

    const queries = [
      `CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        name TEXT,
        email TEXT,
        portfolio_size INTEGER,
        domain_categories TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER,
        type TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      )`
    ];

    for (const query of queries) {
      await new Promise<void>((resolve, reject) => {
        this.db?.run(query, (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      this.db?.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await new Promise<void>((resolve, reject) => {
      this.db?.run(sql, params, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
} 