/* eslint-disable global-require */
// import { app } from 'electron';
import sqlite from 'better-sqlite3';
import path from 'path';

const Store = require('electron-store');

const store = new Store();

const workSpaceUrl = store.get('workSpace') || '';
let db: any;

export default function connect() {
  return sqlite(path.join(workSpaceUrl, '/daily.db'), {});
}

export function init() {
  db = connect();

  const stmAllTable = db.prepare(
    `select name from sqlite_master where type='table' order by name`,
  );
  const tables = stmAllTable.all()?.map((item: any) => item.name);

  if (!tables.includes('list_table')) {
    db.exec(`create table if not exists list_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      code int,
      content varchar(5000),
      createTime int,
      updateTime int,
      category varchar(500),
      tag varchar(2000)
    )`);
  }
  if (!tables.includes('category_table')) {
    db.exec(`create table if not exists category_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name varchar(500),
      remark varchar(500),
      count int,
      createTime int,
      current varchar(10),
      sort int
    )`);
  }

  // db.exec(`DROP TABLE cats`)//删除表
}
