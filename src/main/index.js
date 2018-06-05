'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  if (!process.env.IS_WEB) {
    // Dans le processus principal .
    const {ipcMain} = require('electron')
    var promptResponse
    ipcMain.on('prompt', function (eventRet, arg) {
      promptResponse = null
      var promptWindow = new BrowserWindow({
        width: 320,
        height: 180,
        show: false,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        frame: false
      })
      const promptHtml = [
        '<label for="val">', arg.text, '</label>',
        '<input id="val" value="', arg.defaultText || '', '" autofocus />',
        '<button onclick="require(\'electron\').ipcRenderer.send(\'prompt-response\', document.getElementById(\'val\').value);window.close()">Continuer</button>',
        '<style>body {font-family: sans-serif;} button {float:right; margin-left: 10px;} label,input {margin-bottom: 10px; width: 100%; display:block;}</style>'].join('')
      promptWindow.loadURL('data:text/html,' + promptHtml)
      promptWindow.show()
      promptWindow.on('closed', function () {
        eventRet.returnValue = promptResponse
        promptWindow = null
      })
    })
    ipcMain.on('prompt-response', function (event, arg) {
      if (arg === '') { arg = null }
      promptResponse = arg
    })
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
