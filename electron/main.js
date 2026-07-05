const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const { findDuplicates } = require('./services/duplicateFinder')
const { moveToRecycleBin } = require('./services/fileDeleter')

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.setMenu(null)

  const isDev = !app.isPackaged

  if(!isDev) {
    win.webContents.on('before-input-event', (event, input) => {
      if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
        event.preventDefault()
      }
    })

    win.webContents.on('context-menu', e => e.preventDefault())

    win.loadFile(path.join(__dirname, '../renderer/out/index.html'))
  } else {
    win.webContents.on('before-input-event', (event, input) => {

      if (
          (input.control && input.shift && input.key.toLowerCase() === 'i') ||
          (input.meta && input.alt && input.key.toLowerCase() === 'i')
      ) {
        win.webContents.openDevTools({mode: 'detach'})
      }
    })
    win.loadURL('http://localhost:3000')
  }
}

ipcMain.handle('pick-folder', async (_, compareByName, compareBySize, compareByHash) => {
  console.log('[Main] pick-folder: Opening folder selection dialog');
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (canceled) {
    console.log('[Main] pick-folder: User cancelled folder selection');
    return null;
  }
  console.log(`[Main] pick-folder: Folder selected: "${filePaths[0]}"`);
  console.log(`[Main] pick-folder: Scanning with criteria - byName: ${compareByName}, bySize: ${compareBySize}, byHash: ${compareByHash}`);
  const result = await findDuplicates(filePaths[0], compareByName, compareBySize, compareByHash);
  console.log(`[Main] pick-folder: Scan complete, found ${result?.duplicates?.length ?? 0} files`);
  return result;
})

ipcMain.handle('refresh', async (_, basePath, compareByName, compareBySize, compareByHash) => {
  console.log(`[Main] refresh: Re-scanning folder "${basePath}"`);
  const result = await findDuplicates(basePath, compareByName, compareBySize, compareByHash);
  console.log(`[Main] refresh: Scan complete, found ${result?.duplicates?.length ?? 0} files`);
  return result;
})

ipcMain.handle('delete-files', async (_, baseFolder, files) => {
  return await moveToRecycleBin(baseFolder, files)
})

app.whenReady().then(createWindow)
