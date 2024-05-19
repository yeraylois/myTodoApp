import initSqlJs, { Database } from 'sql.js';

export const initSqlJsInstance = async () => {
  const SQL = await initSqlJs({
    locateFile: file => `./assets/${file}`
  });
  return SQL;
};

export const getDatabase = async () => {
  const SQL = await initSqlJsInstance();
  const db = new SQL.Database();
  return db;
};
