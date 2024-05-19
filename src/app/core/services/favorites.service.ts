import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import initSqlJs, { Database, SqlJsStatic, SqlValue } from 'sql.js';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Task } from '../models/task.model';
import { FirestoreService } from './firestore.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private db: Database | SQLiteObject | null = null;
  private isCordova: boolean = false;
  private favoritesSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
  public favorites$: Observable<Task[]> = this.favoritesSubject.asObservable();

  constructor(
    private platform: Platform,
    private ngZone: NgZone,
    private firestoreService: FirestoreService,
    private sqlite: SQLite
  ) {
    this.platform.ready().then(async () => {
      this.isCordova = this.platform.is('cordova');
      if (this.isCordova) {
        await this.initializeCordovaDatabase();
      } else {
        await this.initializeWebDatabase();
      }
    });
  }

  async initializeCordovaDatabase() {
    try {
      this.db = await this.sqlite.create({
        name: 'favorites.db',
        location: 'default'
      });
      if (this.db) {
        await this.db.executeSql(`CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          image TEXT,
          isFavorite INTEGER,
          date TEXT
        )`, []);
        this.syncFavoritesFromFirebase();
      }
    } catch (error) {
      await this.initializeWebDatabase();
    }
  }

  async initializeWebDatabase() {
    try {
      const SQL = await window.initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
      });
      this.db = new SQL.Database();
      this.db.run(`CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        image TEXT,
        isFavorite INTEGER,
        date TEXT
      )`);
      this.syncFavoritesFromFirebase();
    } catch (error) {
      console.error('Unable to open web database', error);
    }
  }

  private async ensureDatabaseReady() {
    if (!this.db) {
      if (this.isCordova) {
        await this.initializeCordovaDatabase();
      } else {
        await this.initializeWebDatabase();
      }
    }
  }

  private syncFavoritesFromFirebase() {
    this.firestoreService.getTasks().subscribe(async tasks => {
      await this.ensureDatabaseReady();
      if (this.db) {
        if (this.isCordova && 'executeSql' in this.db) {
          await (this.db as SQLiteObject).executeSql('DELETE FROM favorites', []);
        } else if ('run' in this.db) {
          (this.db as Database).run('DELETE FROM favorites');
        }

        for (const task of tasks) {
          let date: Date;
          if (task.date instanceof Timestamp) {
            date = task.date.toDate();
          } else {
            date = new Date(task.date);
          }
          if (isNaN(date.getTime())) {
            continue;
          }

          if (this.isCordova && 'executeSql' in this.db) {
            await (this.db as SQLiteObject).executeSql(
              'INSERT INTO favorites (id, name, description, image, date, isFavorite) VALUES (?, ?, ?, ?, ?, ?)',
              [task.id, task.name, task.description, task.image, date.toISOString(), task.isFavorite ? 1 : 0]
            );
          } else if ('run' in this.db) {
            (this.db as Database).run(
              'INSERT INTO favorites (id, name, description, image, date, isFavorite) VALUES (?, ?, ?, ?, ?, ?)',
              [task.id, task.name, task.description, task.image, date.toISOString(), task.isFavorite ? 1 : 0]
            );
          }
        }
        this.loadFavorites();
      }
    });
  }

  public async loadFavorites() { // Asegúrate de que este método sea público
    await this.ensureDatabaseReady();
    if (this.db) {
      let tasks: Task[] = [];
      if (this.isCordova && 'executeSql' in this.db) {
        const res = await (this.db as SQLiteObject).executeSql('SELECT * FROM favorites WHERE isFavorite = 1', []);
        for (let i = 0; i < res.rows.length; i++) {
          const row = res.rows.item(i);
          tasks.push({
            id: row.id,
            name: row.name,
            description: row.description,
            image: row.image,
            date: new Date(row.date),
            isFavorite: row.isFavorite === 1
          });
        }
      } else if ('exec' in this.db) {
        const res = (this.db as Database).exec('SELECT * FROM favorites WHERE isFavorite = 1');
        if (res[0]) {
          tasks = res[0].values.map((row: SqlValue[]) => ({
            id: row[0] as string,
            name: row[1] as string,
            description: row[2] as string,
            image: row[3] as string,
            date: new Date(row[4] as string),
            isFavorite: (row[5] as number) === 1
          }));
        }
      }
      console.log('Favorites loaded from database:', tasks); // Añade este log
      this.favoritesSubject.next(tasks);
    }
  }

  async addFavorite(task: Task) {
    await this.ensureDatabaseReady();
    const { id, name, description, image, date, isFavorite } = task;
    try {
      // Verificar si el favorito ya existe
      const isFavoriteExist = await this.isFavorite(id);
      if (isFavoriteExist) {
        await this.updateFavorite(task);
        return;
      }

      const taskDate = new Date(date);
      if (isNaN(taskDate.getTime())) {
        return;
      }

      if (this.db) {
        if (this.isCordova && 'executeSql' in this.db) {
          await (this.db as SQLiteObject).executeSql(
            'INSERT INTO favorites (id, name, description, image, date, isFavorite) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, description, image, taskDate.toISOString(), isFavorite ? 1 : 0]
          );
        } else if ('run' in this.db) {
          (this.db as Database).run(
            'INSERT INTO favorites (id, name, description, image, date, isFavorite) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, description, image, taskDate.toISOString(), isFavorite ? 1 : 0]
          );
        }
        this.loadFavorites();
      }
    } catch (error) {
      console.error('Error adding favorite', error);
    }
  }

  async updateFavorite(task: Task) {
    await this.ensureDatabaseReady();
    const { id, name, description, image, date, isFavorite } = task;
    try {
      const taskDate = new Date(date);
      if (isNaN(taskDate.getTime())) {
        return;
      }

      if (this.db) {
        if (this.isCordova && 'executeSql' in this.db) {
          await (this.db as SQLiteObject).executeSql(
            'UPDATE favorites SET name = ?, description = ?, image = ?, date = ?, isFavorite = ? WHERE id = ?',
            [name, description, image, taskDate.toISOString(), isFavorite ? 1 : 0, id]
          );
        } else if ('run' in this.db) {
          (this.db as Database).run(
            'UPDATE favorites SET name = ?, description = ?, image = ?, date = ?, isFavorite = ? WHERE id = ?',
            [name, description, image, taskDate.toISOString(), isFavorite ? 1 : 0, id]
          );
        }
        this.loadFavorites();
      }
    } catch (error) {
      console.error('Error updating favorite', error);
    }
  }

  async removeFavorite(id: string) {
    await this.ensureDatabaseReady();
    try {
      if (this.db) {
        if (this.isCordova && 'executeSql' in this.db) {
          await (this.db as SQLiteObject).executeSql('DELETE FROM favorites WHERE id = ?', [id]);
        } else if ('run' in this.db) {
          (this.db as Database).run('DELETE FROM favorites WHERE id = ?', [id]);
        }
        this.loadFavorites();
      }
    } catch (error) {
      console.error('Error removing favorite', error);
    }
  }

  async isFavorite(id: string): Promise<boolean> {
    await this.ensureDatabaseReady();
    try {
      if (this.db) {
        let isFav = false;

        if (this.isCordova && 'executeSql' in this.db) {
          const res = await (this.db as SQLiteObject).executeSql('SELECT * FROM favorites WHERE id = ?', [id]);
          isFav = res.rows.length > 0 && res.rows.item(0).isFavorite === 1;
        } else if (this.db && 'exec' in this.db) {
          const res = (this.db as Database).exec('SELECT * FROM favorites WHERE id = ?', [id]);
          if (res[0] && res[0].values.length > 0) {
            isFav = res[0].values[0][5] === 1; // Asumiendo que la columna 'isFavorite' es la sexta columna
          }
        }

        return isFav;
      }
      return false;
    } catch (error) {
      console.error('Error checking if favorite', error);
      return false;
    }
  }

  public async printFavorites() {
    await this.ensureDatabaseReady();
    if (this.db) {
      let tasks: Task[] = [];
      if (this.isCordova && 'executeSql' in this.db) {
        const res = await (this.db as SQLiteObject).executeSql('SELECT * FROM favorites', []);
        for (let i = 0; i < res.rows.length; i++) {
          const row = res.rows.item(i);
          tasks.push({
            id: row.id,
            name: row.name,
            description: row.description,
            image: row.image,
            date: new Date(row.date),
            isFavorite: row.isFavorite === 1
          });
        }
      } else if ('exec' in this.db) {
        const res = (this.db as Database).exec('SELECT * FROM favorites');
        if (res[0]) {
          tasks = res[0].values.map((row: SqlValue[]) => ({
            id: row[0] as string,
            name: row[1] as string,
            description: row[2] as string,
            image: row[3] as string,
            date: new Date(row[4] as string),
            isFavorite: (row[5] as number) === 1
          }));
        }
      }
      console.log('Current state of favorites table:', tasks);
    }
  }

}
