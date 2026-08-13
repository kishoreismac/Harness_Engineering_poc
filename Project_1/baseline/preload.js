const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('docu', { pickDocument: () => ipcRenderer.invoke('pick-document') });
