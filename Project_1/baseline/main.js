const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1060,
    minHeight: 680,
    backgroundColor: '#f5f3ee',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile('index.html');
}

ipcMain.handle('pick-document', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Add a document',
    properties: ['openFile'],
    filters: [{ name: 'Documents', extensions: ['txt', 'md', 'pdf'] }]
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const filePath = result.filePaths[0];
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return { name: path.basename(filePath), type: 'PDF', content: 'PDF preview is unavailable in this demo workspace. The document has been added to your library.' };
  return { name: path.basename(filePath), type: ext === '.md' ? 'MD' : 'TXT', content: fs.readFileSync(filePath, 'utf8') };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
