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
    console.log('👉👉👉-----------------workSpace', workSpace);
    // 查看fileDaily文件夹是否存在，不存在则创建
    fs.access(workSpace, (err: any) => {
      if (err) {
        fs.mkdir(workSpace, (error: any) => {
          if (error) return;
          console.log('👉👉👉--------------->fileDaily目录创建成功');
        });
      }
    });
    // 查看fileDaily/file文件夹是否存在，不存在则创建
    fs.access(workSpace, (err: any) => {
      if (err) {
        fs.mkdir(workSpace, (error: any) => {
          if (error) return;
          console.log('👉👉👉--------------->file目录创建成功');
        });
      }
    });
  },
};
