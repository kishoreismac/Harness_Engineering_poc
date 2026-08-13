import { dialog, ipcMain } from 'electron';
import { readFile, stat } from 'node:fs/promises';
import { IPC_CHANNELS } from '../shared/types';
import { DocumentService } from '../services/document-service';
import { IndexingService } from '../services/indexing-service';
import { QaService } from '../services/qa-service';

export function registerIpcHandlers(documents: DocumentService, indexing: IndexingService, qa: QaService): void {
  ipcMain.handle(IPC_CHANNELS.documentsList, () => documents.list());
  ipcMain.handle(IPC_CHANNELS.documentsGet, (_event, id: string) => documents.get(id));
  ipcMain.handle(IPC_CHANNELS.documentsDelete, async (_event, id: string) => { await documents.delete(id); });
  ipcMain.handle(IPC_CHANNELS.documentsImport, async () => { const result = await dialog.showOpenDialog({ title: 'Import document', properties: ['openFile'], filters: [{ name: 'Text documents', extensions: ['txt', 'md'] }] }); if (result.canceled || !result.filePaths[0]) return { canceled: true }; const filePath = result.filePaths[0]; const fileStat = await stat(filePath); const document = await documents.importFile(filePath, await readFile(filePath, 'utf8'), fileStat.size); await indexing.start(document.id); return { canceled: false, document }; });
  ipcMain.handle(IPC_CHANNELS.indexingStart, (_event, documentId?: string) => indexing.start(documentId));
  ipcMain.handle(IPC_CHANNELS.indexingStatus, () => indexing.status());
  ipcMain.handle(IPC_CHANNELS.indexingChunks, (_event, id: string) => indexing.chunks(id));
  ipcMain.handle(IPC_CHANNELS.qaAsk, (_event, question: string) => qa.ask(question));
  ipcMain.handle(IPC_CHANNELS.qaHistory, () => qa.history());
}
