const fs = require('fs');
const path = require('path');

export default function chooseFolder() {
  // 从命令行参数中获取文件夹路径
  const folderPath = process.argv[2];
  if (!folderPath) {
    console.error('未提供文件夹路径');
    return;
  }

  try {
    // 判断指定路径是否为文件夹
    const stats = fs.statSync(folderPath);
    if (stats.isDirectory()) {
      console.log(`${folderPath} 是一个有效的文件夹路径`);

      // TODO: 对该文件夹进行其他操作...
    } else {
      console.error(`${folderPath} 不是一个有效的文件夹路径`);
    }
  } catch (err) {
    console.error(`无法访问 ${folderPath}:`, err);
  }
}
