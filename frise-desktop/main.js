const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const MAX_BYTES = 60 * 1024 * 1024;
let win = null;
let pageReady = false;
let pendingFile = null;

// Fichier .frise passé en argument (double-clic dans l'Explorateur ou « Ouvrir avec »)
function friseArg(argv) {
  return argv.slice(1).find(a => /\.(frise|json)$/i.test(a) && fs.existsSync(a)) || null;
}

function sendFile(file) {
  if (!file) return;
  if (!pageReady) { pendingFile = file; return; }
  try {
    if (fs.statSync(file).size > MAX_BYTES) return;
    win.webContents.send('open-frise', fs.readFileSync(file));
  } catch (e) { /* fichier illisible : la page n'est pas modifiée */ }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Frise Chronologique',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  Menu.setApplicationMenu(null);
  win.webContents.on('did-start-loading', () => { pageReady = false; });
  win.loadFile('index.html');
}

// Une seule fenêtre : un second double-clic sur un fichier l'ouvre dans la fenêtre existante.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  pendingFile = friseArg(process.argv);

  app.on('second-instance', (_event, argv) => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
    sendFile(friseArg(argv));
  });

  ipcMain.on('frise-ready', event => {
    if (!win || event.sender !== win.webContents) return;
    pageReady = true;
    const file = pendingFile; pendingFile = null;
    sendFile(file);
  });

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
