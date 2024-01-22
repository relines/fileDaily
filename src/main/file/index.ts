/* eslint-disable no-restricted-syntax */
import { app } from 'electron';

const fs = require('fs');

const { dialog } = require('electron');

export default {
  async chooseFolder() {
    const resp = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return resp.filePaths[0];
  },
  initFolder() {
    const documentUrl = app.getPath('documents');
    // 查看fileDaily文件夹是否存在，不存在则创建
    fs.access(`${documentUrl}/fileDaily`, (err: any) => {
      if (err) {
        fs.mkdir(`${documentUrl}/fileDaily`, (error: any) => {
          if (error) return;
          console.log('👉👉👉--------------->fileDaily目录创建成功');
        });
      }
    });
    // 查看fileDaily/file文件夹是否存在，不存在则创建
    fs.access(`${documentUrl}/fileDaily/file`, (err: any) => {
      if (err) {
        fs.mkdir(`${documentUrl}/fileDaily/file`, (error: any) => {
          if (error) return;
          console.log('👉👉👉--------------->file目录创建成功');
        });
      }
    });
  },
};
