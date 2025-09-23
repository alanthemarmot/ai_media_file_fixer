const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  renameFile: (originalPath, newName) =>
    ipcRenderer.invoke('rename-file', originalPath, newName),

  validateFilename: (filename) =>
    ipcRenderer.invoke('validate-filename', filename),

  showOpenDialog: (options) =>
    ipcRenderer.invoke('show-open-dialog', options),
});