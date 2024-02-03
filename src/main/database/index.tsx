/* eslint-disable global-require */
// import { app } from 'electron';
import sqlite from 'better-sqlite3';
import path from 'path';

const Store = require('electron-store');

const store = new Store();
let db: any;

export default function connect() {
  const workSpaceUrl = store.get('workSpace') || '';
  return sqlite(path.join(workSpaceUrl, '/daily.db'), {});
}

export function initDatabase() {
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
      tag TEXT,
      address varchar(2000),
      fileList TEXT
    )`);
  }
  if (!tables.includes('category_table')) {
    db.exec(`create table if not exists category_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name varchar(500),
      remark varchar(500),
      createTime int,
      sort int
    )`);
  }
  if (!tables.includes('tag_table')) {
    db.exec(`create table if not exists tag_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name varchar(500),
      createTime int,
      sort int
    )`);
  }
  if (!tables.includes('address_table')) {
    db.exec(`create table if not exists address_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      content varchar(2000),
      createTime int
    )`);
  }

  // db.exec(`DROP TABLE cats`)//删除表
}
