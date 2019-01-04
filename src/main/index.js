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

  // mainWindow.openDevTools({detach: true})

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.BABEL_ENV !== 'web') {
    global.pathToDocumentsFolder = app.getPath('documents')
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

if (process.env.BABEL_ENV !== 'web') {
  var electron = require('electron')
  var Menu = electron.Menu
  let template = [{
    label: 'Fichier',
    submenu: [{
      label: 'Nouveau',
      accelerator: 'CmdOrCtrl+N',
      click: function (item, focusedWindow, event) {
        if (focusedWindow) {
          focusedWindow.webContents.send('new')
        }
      }
    }, {
      type: 'separator'
    }, {
      label: 'Ouvrir...',
      accelerator: 'CmdOrCtrl+O',
      click: function (item, focusedWindow, event) {
        if (focusedWindow) {
          focusedWindow.webContents.send('open')
        }
      }
    }, {
      label: 'Recharger',
      accelerator: 'CmdOrCtrl+R',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          // on reload, start fresh and close any old
          // open secondary windows
          if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach(function (win) {
              if (win.id > 1) {
                win.close()
              }
            })
          }
          focusedWindow.reload()
        }
      }
    }, {
      type: 'separator'
    }, {
      label: 'Enregistrer',
      accelerator: 'CmdOrCtrl+S',
      click: (item, focusedWindow, event) => {
        if (focusedWindow) {
          focusedWindow.webContents.send('save')
        }
      }
    }, {
      label: 'Enregistrer sous...',
      accelerator: 'ALt+CmdOrCtrl+S',
      click: (item, focusedWindow, event) => {
        if (focusedWindow) {
          focusedWindow.webContents.send('saveas')
        }
      }
    }]
  }, {
    label: 'Éditer',
    submenu: [{
      label: 'Annuler',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: 'Refaire',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: 'Couper',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copier',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Coller',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: 'Tout sélectionner',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  /* // }, {
    // label: 'Vue',
    // submenu: [
      // }, {
      //   type: 'separator'
      // }, {
      //   label: 'App Menu Demo',
      //   click: function (item, focusedWindow) {
      //     if (focusedWindow) {
      //       const options = {
      //         type: 'info',
      //         title: 'Application Menu Demo',
      //         buttons: ['Ok'],
      //         message: 'This demo is for the Menu section, showing how to create a clickable menu item in the application menu.'
      //       }
      //       electron.dialog.showMessageBox(focusedWindow, options, function () {})
      //     }
      //   }
    // }] */
  }, {
    label: 'Fenêtre',
    role: 'window',
    submenu: [{
      label: 'Réduire',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: 'Fermer',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, {
      label: 'Plein écran',
      accelerator: (function () {
        if (process.platform === 'darwin') {
          return 'Ctrl+Command+F'
        } else {
          return 'F11'
        }
      })(),
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      }
    }, {
      label: 'Outils de développement',
      accelerator: (function () {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I'
        } else {
          return 'Ctrl+Shift+I'
        }
      })(),
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      }
    }, {
      type: 'separator'
    }, {
      label: 'Réouvrir',
      accelerator: 'CmdOrCtrl+Shift+T',
      enabled: false,
      key: 'reopenMenuItem',
      click: function () {
        app.emit('activate')
      }
    }]
  }, {
    label: 'Aide',
    role: 'help',
    submenu: [{
      label: 'En travaux...',
      click: function () {
        // electron.shell.openExternal('http://electron.atom.io')
      }
    }]
  }]
  function addUpdateMenuItems (items, position) { // eslint-disable-line no-inner-declarations
    if (process.mas) return
    const version = app.getVersion()
    let updateItems = [{
      label: `Version ${version}`,
      enabled: false
    }, {
      label: 'Mise à jour',
      enabled: false,
      key: 'checkingForUpdate'
    }, {
      label: 'Rechercher',
      visible: false,
      key: 'checkForUpdate',
      click: function () {
        require('electron').autoUpdater.checkForUpdates()
      }
    }, {
      label: 'Redémarrer et installer',
      enabled: true,
      visible: false,
      key: 'restartToUpdate',
      click: function () {
        require('electron').autoUpdater.quitAndInstall()
      }
    }]
    items.splice.apply(items, [position, 0].concat(updateItems))
  }
  function findReopenMenuItem () { // eslint-disable-line no-inner-declarations
    const menu = Menu.getApplicationMenu()
    if (!menu) return
    let reopenMenuItem
    menu.items.forEach(function (item) {
      if (item.submenu) {
        item.submenu.items.forEach(function (item) {
          if (item.key === 'reopenMenuItem') {
            reopenMenuItem = item
          }
        })
      }
    })
    return reopenMenuItem
  }
  if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [{
        label: `À propos de ${name}`,
        role: 'about'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: `Masquer ${name}`,
        accelerator: 'Command+H',
        role: 'hide'
      }, {
        label: 'Masquer les autres',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      }, {
        label: 'Afficher tout',
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: 'Quitter',
        accelerator: 'Command+Q',
        click: function () {
          app.quit()
        }
      }]
    })
    // Window menu.
    template[3].submenu.push({
      type: 'separator'
    }, {
      label: 'Tout mettre au premier plan',
      role: 'front'
    })
    addUpdateMenuItems(template[0].submenu, 1)
  }
  if (process.platform === 'win32') {
    const helpMenu = template[template.length - 1].submenu
    addUpdateMenuItems(helpMenu, 0)
  }
  app.on('ready', function () {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  })
  app.on('browser-window-created', function () {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = false
  })
  app.on('window-all-closed', function () {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = true
  })

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
}
