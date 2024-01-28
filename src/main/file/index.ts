/* eslint-disable no-plusplus */
/* eslint-disable func-names */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
import path from 'path';
import dayjs from 'dayjs';
// import exif from 'exif';
const ffmpeg = require('fluent-ffmpeg');
const exec = require('child_process').exec;

const fs = require('fs');
const { dialog } = require('electron');
const Store = require('electron-store');

const store = new Store();

// async function getExifAsync(imgPath: any) {
//   return new Promise(function (resolve) {
//     new exif.ExifImage({ image: imgPath }, function (
//       error: any,
//       exifData: any,
//     ) {
//       if (error) {
//         resolve({ code: 400, data: null, message: error });
//       } else {
//         resolve({ code: 200, data: exifData, message: error });
//       }
//     });
//   });
// }

// const getFileExifInfo = (url: string) => {
//   const extensionName = path.extname(url);
//   if (['.png', '.jpg', '.HEIC', '.JPEG'].includes(extensionName)) {
//     return new Promise((resolve) => {
//       const exifInfo = getExifAsync(url);
//       resolve(exifInfo);
//     });
//   }
//   return null;
// };

const getFileCreateTime = (url: string) => {
  const parseUrl = path.parse(url);
  return new Promise((resolve, reject) => {
    fs.stat(url, (err: any, data: any) => {
      if (err) reject(err);
      resolve({ createTime: data.birthtime, url, parseUrl });
    });
  });
};

export default {
  async chooseFolder() {
    const resp = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (resp.canceled) {
      return '';
    }
    return resp.filePaths[0];
  },
  async openFolder(val: any) {
    exec(`open -R ${val}`);
  },
  async chooseFile() {
    const resp = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    });
    if (resp.canceled) {
      return '';
    }
    const promises = resp.filePaths.map((item) => {
      return getFileCreateTime(item);
    });

    const data = await Promise.all(promises);
    return data;
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
  copyFileList(val: any) {
    const { currentCategory, fileList } = val;
    const workSpace = store.get('workSpace');
    if (!fs.existsSync(`${workSpace}/file/${currentCategory}`)) {
      //  先判断目标文件夹是否存在，不存在则创建
      fs.mkdirSync(`${workSpace}/file/${currentCategory}`);
    }
    const newFileList = fileList.map((item: any) => {
      const formatTime = dayjs(new Date()).format('YYYYMMDDHHmmss');
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const destUrl = `${workSpace}/file/${currentCategory}/${
        item.name.split('.')[0]
      }-${formatTime}-${random4}.${item.name.split('.')[1]}`;

      fs.createReadStream(item.url).pipe(fs.createWriteStream(destUrl));
      return {
        ...item,
        url: destUrl,
      };
    });
    return {
      ...val,
      fileList: newFileList,
    };
  },
};
