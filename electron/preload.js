const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    pickFolder: (compareByName, compareBySize, compareByHash) => ipcRenderer.invoke('pick-folder', compareByName, compareBySize, compareByHash),
    refresh: (baseFolder, compareByName, compareBySize, compareByHash) => ipcRenderer.invoke('refresh', baseFolder, compareByName, compareBySize, compareByHash),
    deleteFiles: (baseFolder, files) => ipcRenderer.invoke('delete-files', baseFolder, files),
})
