// Pont minimal entre l'application et la page : seule la réception d'un fichier .frise est exposée.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('friseDesktop', {
  onOpenFile(callback) {
    ipcRenderer.on('open-frise', (_event, bytes) => callback(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
    ipcRenderer.send('frise-ready');
  }
});
