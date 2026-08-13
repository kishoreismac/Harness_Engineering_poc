import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { registerIpcHandlers } from './ipc-handlers';
import { PersistenceService } from '../services/persistence-service';
import { DocumentService } from '../services/document-service';
import { IndexingService } from '../services/indexing-service';
import { QaService } from '../services/qa-service';

function createWindow(): BrowserWindow { const window = new BrowserWindow({ width: 1200, height: 800, minWidth: 960, minHeight: 640, title: 'Knowledge Base', backgroundColor: '#101715', webPreferences: { preload: path.join(__dirname, '../preload/preload.js'), contextIsolation: true, nodeIntegration: false } }); void window.loadFile(path.join(__dirname, '../renderer/index.html')); return window; }
app.whenReady().then(() => { const persistence = new PersistenceService(app.getPath('userData')); const documents = new DocumentService(persistence); const indexing = new IndexingService(persistence, documents); registerIpcHandlers(documents, indexing, new QaService(persistence, documents, indexing)); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
