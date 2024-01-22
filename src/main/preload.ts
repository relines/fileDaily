// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = string;

const electronHandler = {
  ipcRenderer: {
    setStoreValue: (key: string, value: any) => {
      ipcRenderer.send('setStore', key, value);
    },

    getStoreValue(key: string) {
      const resp = ipcRenderer.sendSync('getStore', key);
      return resp;
    },
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    invoke: async (channel: Channels, data: any) => {
      const result = await ipcRenderer.invoke(channel, data);
      return result;
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
