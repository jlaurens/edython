'use strict'

import { app, BrowserWindow } from 'electron'

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
    height: 763,
    useContentSize: true,
    width: 1100,
    show: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.openDevTools({detach: true})

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
        parent: mainWindow,
        modal: true,
        width: 600,
        height: 150,
        show: false,
        webPreferences: {
          devTools: false
        }
      })
      const promptHtml = [
        '<label id="label" for="value"></label>',
        '<input type="text" id="value" autofocus onkeydown="if (event.keyCode == 13) document.getElementById(\'button\').click()"/>',
        '<button id="button" onclick="require(\'electron\').ipcRenderer.send(\'prompt-response\', document.getElementById(\'value\').value);window.close()">Continuer</button>',
        '<style>body {font-family: sans-serif;} button {float:right; margin-left: 10px;} label,input {font-size: 16px;margin-bottom: 10px; width: 100%; display:block;padding:6px 6px;}',
        'button {',
        '  -moz-border-radius:6px;',
        '  -webkit-border-radius:6px;',
        '  border-radius:6px;',
        '  border:1px solid #dcdcdc;',
        '  display:inline-block;',
        '  cursor:pointer;',
        '  color:#666666;',
        '  font-family:sans-serif;',
        '  font-size:16px;',
        '  padding:6px 24px;',
        '  text-decoration:none;',
        '  text-shadow:0px 1px 0px #ffffff;',
        '}',
        'button:hover {',
        '  color:#336666;',
        '}',
        'button:active {',
        '  position:relative;',
        '  top:1px;',
        '}',
        '</style>'].join('')
      // const promptURL = process.env.NODE_ENV === 'development'
      //   ? `http://localhost:9080/prompt.html`
      //   : `file://${__dirname}/prompt.html`
      const promptURL = `data:text/html,${promptHtml}`
      promptWindow.loadURL(promptURL)
      promptWindow.once('ready-to-show', () => {
        var text = arg.text.replace('\'', '&apos;').replace('"', '&quot;')
        promptWindow.webContents.executeJavaScript('document.getElementById(\'label\').innerHTML = \'' + text + '\'')
        text = (arg.defaultText || '').replace('\'', '&apos;').replace('"', '&quot;')
        promptWindow.webContents.executeJavaScript('document.getElementById(\'value\').setAttribute(\'value\', \'' + text + '\')')
        promptWindow.show()
      })
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
