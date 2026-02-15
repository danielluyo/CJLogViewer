const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

if (process.platform === 'darwin') {
  app.setName('CJLogViewer');
}


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../build/icon.png'),
    backgroundColor: '#0f172a'
  });

  if (isDev) {
    win.loadURL('http://localhost:5188');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // if (isDev) {
  //   win.webContents.openDevTools();
  // }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../build/icon.png'));
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSONL', extensions: ['jsonl'] }]
  });
  if (canceled) {
    return null;
  } else {
    const content = fs.readFileSync(filePaths[0], 'utf8');
    return { path: filePaths[0], content };
  }
});
