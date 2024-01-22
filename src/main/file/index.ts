/* eslint-disable no-restricted-syntax */
const fs = require('fs');

const { dialog } = require('electron');
const Store = require('electron-store');

const store = new Store();

export default {
  async chooseFolder() {
    const resp = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return resp.filePaths[0];
  },
  initFolder() {
    const workSpace = store.get('workSpace');
    // 查看workSpace文件夹是否存在，不存在则创建
    fs.access(workSpace, (err: any) => {
      console.log('👉👉👉--------------->fileDaily文件夹是否存在', err);
      if (err) {
        fs.mkdir(workSpace, (error: any) => {
          if (error) return;
          console.log('👉👉👉--------------->fileDaily目录创建成功');
        });
      }
    });
    // 查看workSpace/file文件夹是否存在，不存在则创建
    fs.access(`${workSpace}/file`, (err: any) => {
      if (err) {
        fs.mkdir(`${workSpace}/file`, (error: any) => {
          if (error) return;
          console.log('👉👉👉--------------->file目录创建成功');
        });
      }
    });
  },
};
