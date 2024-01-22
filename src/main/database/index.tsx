/* eslint-disable global-require */
// import { app } from 'electron';
import sqlite from 'better-sqlite3';
import path from 'path';

let db: any;

const os = require('os');

const homedir = os.homedir(); // 用于获取当前用户的主目录路径
const dbUrl = homedir.replace(/\\/g, '\\\\'); // 替换绝对和相对路径

// const documentUrl = app.getPath('documents');
// console.log(111, documentUrl);

export default function connect() {
  return sqlite(path.join(dbUrl, '/jhy/db/daily.db'), {
    verbose: () => {
      console.log('👉👉👉-----------------sqlite3已经连接成功');
      console.log('数据库地址：', dbUrl, `${dbUrl}/jhy/db/daily.db`);
    },
    fileMustExist: true,
  });
}

export function init() {
  db = connect();

  // db.exec(`DROP TABLE cats`)//删除表
  db.exec(`create table if not exists list_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    code int,
    content varchar(5000),
    createTime int,
    updateTime int,
    category varchar(500),
    tag varchar(2000)
  )`);
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
