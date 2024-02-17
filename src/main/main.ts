import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  protocol,
  globalShortcut,
  net,
} from 'electron';
import path from 'path';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { initDatabase } from './database/index';
import listApi from './database/listApi';
import categoryApi from './database/categoryApi';
import tagApi from './database/tagApi';
import addressApi from './database/addressApi';
import calendarApi from './database/calendarApi';
import fileApi from './file/index';

const Store = require('electron-store');

const store = new Store();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let viewWindow: BrowserWindow | null = null;

const openViewWindow = () => {
  if (viewWindow) {
    viewWindow.focus(); // 存在 则聚焦
    return;
  }
  viewWindow = new BrowserWindow({
    width: 950,
    height: 700,
    title: 'view',
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  viewWindow.loadURL(`${resolveHtmlPath('index.html')}?page=view`);

  viewWindow.on('close', () => {
    viewWindow = null;
  });
};

const ipcFunc = () => {
  // electron-store
  ipcMain.on('setStore', (_, key, value) => {
    store.set(key, value);
  });

  ipcMain.on('getStore', (_, key) => {
    const value = store.get(key);
    _.returnValue = value || '';
  });

  // list操作
  ipcMain.handle('add-data', async (event, message) => {
    const result = listApi.addList(message);
    return result;
  });

  ipcMain.handle('update-data', async (event, message) => {
    let copyResult = { ...message.data };
    if (message.categoryChanged) {
      copyResult = await fileApi.copyAllFileList(message);
    } else {
      copyResult = fileApi.copyFileList(message.data);
    }

    const result = listApi.updateList(copyResult);
    return result;
  });

  ipcMain.handle('update-file-list', async (event, message) => {
    const result = listApi.updateFileList(message);
    return result;
  });

  ipcMain.handle('delete-data', async (event, message) => {
    const result = listApi.delList(message);
    return result;
  });

  ipcMain.handle('get-list', async (event, message) => {
    const result = listApi.getList(message);
    return result;
  });
  ipcMain.handle('search-list', async (event, message) => {
    const result = listApi.getList(message);
    return result;
  });

  // calendar操作
  ipcMain.handle('get-calendar', async (event, message) => {
    const result = calendarApi.getCalendar(message);
    return result;
  });
  ipcMain.handle('update-calendar', async (event, message) => {
    const result = calendarApi.updateCalendar(message);
    return result;
  });
  ipcMain.handle('del-calendar', async (event, message) => {
    const result = calendarApi.delCalendar(message);
    return result;
  });

  // 分类操作
  ipcMain.handle('add-category', async (event, message) => {
    const result = categoryApi.addCategory(message);
    mainWindow?.webContents.send('updateCategory');
    return result;
  });
  ipcMain.handle('get-category', async () => {
    const result = categoryApi.getCategory();
    return result;
  });
  ipcMain.handle('update-category', async (event, message) => {
    const result = categoryApi.updateCategory(message);
    mainWindow?.webContents.send('updateCategory');
    return result;
  });
  ipcMain.handle('delete-category', async (event, message) => {
    const result = categoryApi.delCategory(message);
    mainWindow?.webContents.send('updateCategory');
    return result;
  });

  // 标签操作
  ipcMain.handle('add-tag', async (event, message) => {
    const result = tagApi.addTag(message);
    // mainWindow?.webContents.send('updateCategory');
    return result;
  });
  ipcMain.handle('get-tag', async () => {
    const result = tagApi.getTag();
    return result;
  });
  ipcMain.handle('update-tag', async (event, message) => {
    const result = tagApi.updateTag(message);
    // mainWindow?.webContents.send('updateCategory');
    return result;
  });
  ipcMain.handle('delete-tag', async (event, message) => {
    const result = tagApi.delTag(message);
    // mainWindow?.webContents.send('updateCategory');
    return result;
  });

  // 地址操作
  ipcMain.handle('add-address', async (event, message) => {
    const result = addressApi.addAddress(message);
    return result;
  });
  ipcMain.handle('get-address', async () => {
    const result = addressApi.getAddress();
    return result;
  });
  ipcMain.handle('update-address', async (event, message) => {
    const result = addressApi.updateAddress(message);
    return result;
  });
  ipcMain.handle('delete-address', async (event, message) => {
    const result = addressApi.delAddress(message);
    return result;
  });

  // 文件操作
  ipcMain.handle('choose-folder', async () => {
    const result = await fileApi.chooseFolder();
    if (result) {
      store.set('workSpace', result);
      fileApi.initFolder(() => {
        initDatabase();
      });
    }
    return result;
  });
  ipcMain.on('open-folder', (event, message) => {
    fileApi.openFolder(message);
  });
  ipcMain.handle('choose-file', async () => {
    const result = await fileApi.chooseFile();
    if (result) {
      return result;
    }
    return null;
  });
  ipcMain.handle('get-video-path', async () => {
    const resp = await fileApi.getVideoPath();
    return {
      data: resp,
    };
  });
  ipcMain.handle('change-file-name', (event, message) => {
    const result = fileApi.changeFileName(message);
    return result;
  });

  // 窗口操作
  ipcMain.on('main-window-reload', () => {
    mainWindow?.reload();
  });
  ipcMain.on('change-window-size', (event, message) => {
    mainWindow?.setSize(message.width, message.height);
  });
  ipcMain.on('open-view-window', () => {
    openViewWindow();
  });
};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 300,
    height: 600,
    minWidth: 300,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      // webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow?.on('resize', () => {
    mainWindow?.webContents.send(
      'mainWindowResize',
      mainWindow?.isFullScreen(),
    );
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const registerGlobalShortcut = (shortcut: any, callback: any) => {
  if (!shortcut) return false;
  let flag = false;
  try {
    flag = globalShortcut.isRegistered(shortcut);
    if (flag) return true;
    flag = globalShortcut.register(shortcut, () => {
      callback();
    });
  } catch (e) {
    console.error(e);
  }
  return flag;
};

const initWorkSpace = () => {
  if (!store.get('workSpace')) {
    // 默认工作空间在Document/fileDaily
    const documentUrl = app.getPath('documents');
    store.set('workSpace', `${documentUrl}/fileDaily`);
  }
};

const initGlobalShortCut = () => {
  registerGlobalShortcut('F12', () => {
    mainWindow?.webContents.toggleDevTools();
    viewWindow?.webContents.toggleDevTools();
  });
  registerGlobalShortcut('Cmd+R', () => {
    mainWindow?.reload();
    viewWindow?.reload();
  });
};

const init = async () => {
  initWorkSpace();
  fileApi.initFolder(() => {
    initDatabase();
    ipcFunc();
    createWindow();
    initGlobalShortCut();
  });
};

app
  .whenReady()
  .then(() => {
    protocol.registerFileProtocol('atom', (request, callback) => {
      const url = request.url.slice(7);
      callback(decodeURI(path.normalize(url)));
    });
    // protocol.handle('atom2', (request) => {
    //   const url = request.url.slice(6);
    //   return net.fetch(decodeURIComponent(`file://${url}`), {});
    // });
    init();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
