/*
import { Injectable, NgZone } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private dbInstance: SQLiteObject | null = null;

  constructor(private sqlite: SQLite, private platform: Platform, private ngZone: NgZone) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.initializeDatabase();
      } else {
        console.warn('Cordova is not available. Make sure to run this on a device or emulator.');
      }
    });
  }

  async initializeDatabase() {
    try {
      this.dbInstance = await this.sqlite.create({
        name: 'favorites.db',
        location: 'default'
      });
      await this.dbInstance.executeSql(
        `CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          image TEXT
        )`, []);
    } catch (error) {
      console.error('Unable to open database', error);
    }
  }

  private async ensureDatabaseReady() {
    if (!this.dbInstance) {
      await this.initializeDatabase();
    }
  }

  async addFavorite(task: Task) {
    await this.ensureDatabaseReady();
    const { id, name, description, image } = task;
    try {
      await this.dbInstance!.executeSql(
        `INSERT INTO favorites (id, name, description, image) VALUES (?, ?, ?, ?)`,
        [id, name, description, image]
      );
    } catch (error) {
      console.error('Error adding favorite', error);
    }
  }

  async removeFavorite(id: string) {
    await this.ensureDatabaseReady();
    try {
      await this.dbInstance!.executeSql(
        `DELETE FROM favorites WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error('Error removing favorite', error);
    }
  }

  async getFavorites(): Promise<Task[]> {
    await this.ensureDatabaseReady();
    try {
      const res = await this.dbInstance!.executeSql(`SELECT * FROM favorites`, []);
      let tasks: Task[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        tasks.push(res.rows.item(i));
      }
      return tasks;
    } catch (error) {
      console.error('Error getting favorites', error);
      return [];
    }
  }

  async isFavorite(id: string): Promise<boolean> {
    await this.ensureDatabaseReady();
    try {
      const res = await this.dbInstance!.executeSql(
        `SELECT * FROM favorites WHERE id = ?`,
        [id]
      );
      return res.rows.length > 0;
    } catch (error) {
      console.error('Error checking if favorite', error);
      return false;
    }
  }
}
*/

import { Injectable, NgZone } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { Task } from '../models/task.model';
import initSqlJs, { Database } from 'sql.js';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private dbInstance: SQLiteObject | null = null;
  private sqlJsDb: Database | null = null;

  constructor(private sqlite: SQLite, private platform: Platform, private ngZone: NgZone) {
    this.platform.ready().then(async () => {
      if (this.platform.is('cordova')) {
        this.initializeDatabase();
      } else {
        await this.initializeSqlJsDatabase();
      }
    });
  }

  private async initializeSqlJsDatabase() {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/${file}`
      });
      this.sqlJsDb = new SQL.Database();
      this.sqlJsDb.run(`CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        image TEXT
      )`);
      console.log('SQL.js database initialized');
    } catch (error) {
      console.error('Unable to initialize SQL.js database', error);
    }
  }

  private async ensureDatabaseReady() {
    if (this.platform.is('cordova') && !this.dbInstance) {
      await this.initializeDatabase();
    }
    if (!this.platform.is('cordova') && !this.sqlJsDb) {
      await this.initializeSqlJsDatabase();
    }
  }

  private async initializeDatabase() {
    try {
      this.dbInstance = await this.sqlite.create({
        name: 'favorites.db',
        location: 'default'
      });
      await this.dbInstance.executeSql(
        `CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          image TEXT
        )`, []);
    } catch (error) {
      console.error('Unable to open database', error);
    }
  }

  async addFavorite(task: Task) {
    await this.ensureDatabaseReady();
    const { id, name, description, image } = task;
    try {
      if (this.platform.is('cordova')) {
        await this.dbInstance!.executeSql(
          `INSERT INTO favorites (id, name, description, image) VALUES (?, ?, ?, ?)`,
          [id, name, description, image]
        );
      } else {
        const stmt = this.sqlJsDb!.prepare(`INSERT INTO favorites (id, name, description, image) VALUES (?, ?, ?, ?)`);
        stmt.run([id, name, description, image]);
        stmt.free();
      }
    } catch (error) {
      console.error('Error adding favorite', error);
    }
  }

  async removeFavorite(id: string) {
    await this.ensureDatabaseReady();
    try {
      if (this.platform.is('cordova')) {
        await this.dbInstance!.executeSql(
          `DELETE FROM favorites WHERE id = ?`,
          [id]
        );
      } else {
        const stmt = this.sqlJsDb!.prepare(`DELETE FROM favorites WHERE id = ?`);
        stmt.run([id]);
        stmt.free();
      }
    } catch (error) {
      console.error('Error removing favorite', error);
    }
  }

  async getFavorites(): Promise<Task[]> {
    await this.ensureDatabaseReady();
    try {
      if (this.platform.is('cordova')) {
        const res = await this.dbInstance!.executeSql(`SELECT * FROM favorites`, []);
        let tasks: Task[] = [];
        for (let i = 0; i < res.rows.length; i++) {
          tasks.push(res.rows.item(i));
        }
        return tasks;
      } else {
        const res = this.sqlJsDb!.exec(`SELECT * FROM favorites`);
        let tasks: Task[] = [];
        if (res.length > 0) {
          const values = res[0].values;
          tasks = values.map((row: any[]) => ({
            id: row[0],
            name: row[1],
            description: row[2],
            image: row[3]
          }));
        }
        return tasks;
      }
    } catch (error) {
      console.error('Error getting favorites', error);
      return [];
    }
  }

  async isFavorite(id: string): Promise<boolean> {
    await this.ensureDatabaseReady();
    try {
      if (this.platform.is('cordova')) {
        const res = await this.dbInstance!.executeSql(
          `SELECT * FROM favorites WHERE id = ?`,
          [id]
        );
        return res.rows.length > 0;
      } else {
        const res = this.sqlJsDb!.exec(`SELECT * FROM favorites WHERE id = ?`, [id]);
        return res.length > 0 && res[0].values.length > 0;
      }
    } catch (error) {
      console.error('Error checking if favorite', error);
      return false;
    }
  }
}

