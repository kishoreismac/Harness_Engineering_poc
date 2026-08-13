import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, type KnowledgeBaseApi } from '../shared/types';
const api: KnowledgeBaseApi = {
  documents: { list: () => ipcRenderer.invoke(IPC_CHANNELS.documentsList), import: () => ipcRenderer.invoke(IPC_CHANNELS.documentsImport), get: (id) => ipcRenderer.invoke(IPC_CHANNELS.documentsGet, id), delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.documentsDelete, id) },
  indexing: { start: (id) => ipcRenderer.invoke(IPC_CHANNELS.indexingStart, id), status: () => ipcRenderer.invoke(IPC_CHANNELS.indexingStatus), chunks: (id) => ipcRenderer.invoke(IPC_CHANNELS.indexingChunks, id) },
  qa: { ask: (question) => ipcRenderer.invoke(IPC_CHANNELS.qaAsk, question), history: () => ipcRenderer.invoke(IPC_CHANNELS.qaHistory) }
};
contextBridge.exposeInMainWorld('knowledgeBase', api);
