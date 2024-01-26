/* eslint-disable no-new */
/* eslint-disable prefer-template */
/* eslint-disable func-names */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
import path from 'path';
import exif from 'exif';

const fs = require('fs');
const { dialog } = require('electron');
const Store = require('electron-store');

const store = new Store();

export async function getExifAsync(imgPath: any) {
  console.log(111);
  return new Promise(function (resolve) {
    console.log(32123, imgPath);
    new exif.ExifImage({ image: imgPath }, function (
      error: any,
      exifData: any,
    ) {
      console.log(332, exifData, error);
      if (error) {
        resolve({ code: 400, data: null, message: error });
      } else {
        resolve({ code: 400, data: exifData, message: error });
      }
    });
  });
}

const getFileInfo = (url: string) => {
  const extensionName = path.extname(url);
  if (['.png', '.jpg', '.HEIC', '.JPEG'].includes(extensionName)) {
    return new Promise((resolve) => {
      console.log(112);
      const exifInfo = getExifAsync(url);
      resolve(exifInfo);
    });
  }
  return null;
  // return new Promise((resolve, reject) => {
  //   fs.stat(url, (err: any, data: any) => {
  //     if (err) reject(err);
  //     resolve(data);
  //   });
  // });
};

export default {
  async chooseFolder() {
    const resp = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (resp.canceled) {
      return '';
    }
    return resp.filePaths[0];
  },
  async chooseFile() {
    const resp = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    });
    // console.log(333, resp);
    if (resp.canceled) {
      return '';
    }
    const fileArr = resp.filePaths.map(async (item: any) => {
      const data = await getFileInfo(item);
      console.log(12341234, data);
      return data;
    });
    console.log('fileArr', fileArr);
    return resp.filePaths;
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
  getVideoPath() {
    const videoPath = '/Users/popmart/Documents/fileDaily/file/oceans.mp4';
    return new Promise((resolve, reject) => {
      fs.readFile(videoPath, (err: any, data: any) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
};
