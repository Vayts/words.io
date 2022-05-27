import mysql from 'mysql2';

export class MySQLService {
  private static instance: MySQLService | null;

  private db: any;

  constructor() {
    this.connection();
  }

  public static getInstance() {
    if (!MySQLService.instance) {
      MySQLService.instance = new MySQLService();
    }
    return MySQLService.instance;
  } // СОЗДАЕТ ИСКЛЮЧИТЕЛЬНО ОДИН КОННЕКШН

  private connection() {
    this.db = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'users',
    });

    this.db.on('error', () => {
      MySQLService.instance = null;
    });
  }

  read(query: string): any {
    return new Promise((resolve, reject) => {
      this.db.query(query, (err: Error, result: any) => {
        if (err) {
          console.log(err);
          reject({ code: 409, message: 'CONNECTION_ERROR' });
        } else {
          resolve(result);
        }
      });
    });
  }

  update(query: string, column: Record<string, unknown> | string): any {
    return new Promise((resolve, reject) => {
      this.db.query(query, column, (err: Error) => {
        if (err) {
          console.log(err);
          reject({ code: 409, message: 'CONNECTION_ERROR' });
        } else {
          resolve(302);
        }
      });
    });
  }

  create(query: string, column: Record<string, unknown> | string): any {
    return new Promise((resolve, reject) => {
      this.db.query(query, column, (err: Error) => {
        if (err) {
          console.log(err);
          reject({ code: 409, message: 'CONNECTION_ERROR' });
        } else {
          resolve(302);
        }
      });
    });
  }

  delete(query: string) {
    return new Promise((resolve, reject) => {
      this.db.query(query, (err: Error, result: any) => {
        if (err) {
          reject({ code: 409, message: 'CONNECTION_ERROR' });
        } else {
          resolve(result);
        }
      });
    });
  }
}
