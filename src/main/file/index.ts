/* eslint-disable no-plusplus */
/* eslint-disable func-names */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
import path from 'path';
// import exif from 'exif';
// const ffmpeg = require('fluent-ffmpeg');
const exec = require('child_process')?.exec;

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
    const resp = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });
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
    return new Promise((resolve, reject) => {
      // 查看workSpace文件夹是否存在，不存在则创建
      fs.access(workSpace, (err: any) => {
        console.log('👉👉👉--------------->fileDaily文件夹是否存在', err);
        if (err) {
          fs.mkdir(workSpace, (error: any) => {
            if (error) reject();
            resolve({});
            console.log('👉👉👉--------------->fileDaily目录创建成功');
          });
        }
      });
      // 查看workSpace/file文件夹是否存在，不存在则创建
      fs.access(`${workSpace}/file`, (err: any) => {
        if (err) {
          fs.mkdir(`${workSpace}/file`, (error: any) => {
            if (error) reject();
            resolve({});
            console.log('👉👉👉--------------->file目录创建成功');
          });
        }
      });
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
  async copyAllFileList(val: any) {
    // 复制所有文件到新目录，然后删除原目录中的所有文件

    const { category, code, fileList } = val.data;
    const { oriCategory } = val;

    const workSpace = store.get('workSpace');
    const oriDir = `${workSpace}/file/${oriCategory}`; // 原目录
    const destDir = `${workSpace}/file/${category}`; // 新目录

    const et3Arr = ['png', 'jpg', 'gif', 'mp4'];
    const et4Arr = ['jpeg'];

    if (!fs.existsSync(destDir)) {
      //  先判断新目录是否存在，不存在则创建
      fs.mkdirSync(destDir);
    }

    const oriList = fileList.map((item: any) => {
      if (item.url?.indexOf(`${oriDir}/`) !== -1) {
        return item.url?.slice(`${oriDir}/`.length);
      }
      return item.name;
    });

    const promises = fileList.map((item: any) => {
      return new Promise((resolve) => {
        const random4 = Math.floor(1000 + Math.random() * 9000);
        let newName = '';
        let etName = '';
        if (et3Arr.includes(item.name.slice(-3))) {
          newName = item.name.slice(0, -22);
          etName = item.name.slice(-3);
        }
        if (et4Arr.includes(item.name.slice(-4))) {
          newName = item.name.slice(0, -23);
          etName = item.name.slice(-4);
        }

        const destUrl = `${destDir}/${newName}-${code}-${random4}.${etName}`;

        fs.createReadStream(item.url).pipe(fs.createWriteStream(destUrl));

        resolve({
          ...item,
          name: `${newName}-${code}-${random4}.${etName}`,
          url: destUrl,
        });
      });
    });

    const newFileList = await Promise.all(promises);

    // 删除原目录中的文件
    oriList?.forEach((item: any) => {
      fs.unlinkSync(`${oriDir}/${item}`);
    });

    return {
      ...val.data,
      fileList: newFileList,
    };
  },
  copyFileList(val: any) {
    const { category, code, fileList } = val;
    const workSpace = store.get('workSpace');
    const destDir = `${workSpace}/file/${category}`; // 新目录

    if (!fs.existsSync(destDir)) {
      //  先判断目标文件夹是否存在，不存在则创建
      fs.mkdirSync(destDir);
    }
    const oriList = fileList.map((item: any) => {
      if (item.url?.indexOf(`${destDir}/`) !== -1) {
        return item.url?.slice(`${destDir}/`.length);
      }
      return item.name;
    });
    const destList = fs.readdirSync(destDir);
    // fileList和destList对比，文件分为三类：

    // 第一类是多余的，需要删除
    const destList1 = destList.filter((item: any) => item.indexOf(code) !== -1);
    const delList = destList1.filter((item: any) => !oriList.includes(item));
    delList?.forEach((item: any) => {
      fs.unlinkSync(`${destDir}/${item}`);
    });

    // 第二类是已经存在的，不需要操作，跳过即可；
    const oriList1 = oriList.filter((item: any) => destList.includes(item));

    // 第三类是没有的，需要复制
    console.log(333, fileList);
    const newFileList = fileList
      .filter((item: any) => !oriList1.includes(item.name))
      .map((item: any) => {
        const random4 = Math.floor(1000 + Math.random() * 9000);
        const destUrl = `${destDir}/${
          item.name.split('.')[0]
        }-${code}-${random4}.${item.name.split('.')[1]}`;

        fs.createReadStream(item.url).pipe(fs.createWriteStream(destUrl));
        return {
          ...item,
          name: `${item.name.split('.')[0]}-${code}-${random4}.${
            item.name.split('.')[1]
          }`,
          url: destUrl,
        };
      });
    const existFileList = fileList.filter((item: any) =>
      oriList1.includes(item.name),
    );

    return {
      ...val,
      fileList: [...existFileList, ...newFileList],
    };
  },
};
