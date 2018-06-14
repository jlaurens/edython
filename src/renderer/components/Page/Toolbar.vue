<template>
  <div id="toolbar">
    <b-button-toolbar key-nav  aria-label="Main toolbar">
      <b-button-group class="mx-1">
        <b-btn id="toolbar-site" v-on:click=" doSite('https://github.com/jlaurens/edython/')">
          <img src="static/icon.svg" height="32" alt="Edython"/>
        </b-btn>
        <b-btn id="toolbar-debug" v-on:click="doSite('https://github.com/jlaurens/edython/issues')">
          <icon-base width="32" height="32" icon-name="new"><icon-bug /></icon-base>
        </b-btn>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-new" v-on:click="doNew()">
          <icon-base width="32" height="32" icon-name="new"><icon-new /></icon-base>
        </b-btn>
        <b-btn id="toolbar-save" v-on:click="doSave()">
          <icon-base width="32" height="32" icon-name="save"><icon-save /></icon-base>
        </b-btn>
        <b-btn id="toolbar-open" v-on:click="doOpen()">
          <icon-base width="32" height="32" icon-name="load"><icon-load /></icon-base>
        </b-btn>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-copy" v-on:click="doCopy()">
          <icon-base width="32" height="32" icon-name="copy"><icon-copy-paste variant="copy" /></icon-base>
        </b-btn>
        <b-btn id="toolbar-paste" v-on:click="doPaste()">
          <icon-base width="32" height="32" icon-name="paste"><icon-copy-paste variant="paste"/></icon-base>
        </b-btn>
        <b-btn id="toolbar-python" v-on:click="doCopyPythonCode()">
          <icon-base width="32" height="32" icon-name="copy Python"><icon-copy-python /></icon-base>
        </b-btn>
        <b-btn id="toolbar-undo" v-on:click="doUndo()" :disabled="!canUndo">
          <icon-base width="32" height="32" icon-name="undo"><icon-undo-redo variant="undo"/></icon-base>
        </b-btn>
        <b-btn id="toolbar-redo" v-on:click="doRedo()" :disabled="!canRedo">
          <icon-base width="32" height="32"  icon-name="redo"><icon-undo-redo variant="redo"/></icon-base>
        </b-btn>
      </b-button-group>
      <b-tooltip target="toolbar-site" placement="bottom" delay="500">
        Aller au site <strong>Edython</strong>
      </b-tooltip>
      <b-tooltip target="toolbar-debug" placement="bottom" delay="500">
        Notifier un bug
      </b-tooltip>
      <b-tooltip target="toolbar-new" placement="bottom" delay="500">
        Nouveau
      </b-tooltip>
      <b-tooltip target="toolbar-open" placement="bottom" delay="500">
        Ouvrir
      </b-tooltip>
      <b-tooltip target="toolbar-save" placement="bottom" delay="500">
        Sauvegarder
      </b-tooltip>
      <b-tooltip target="toolbar-copy" placement="bottom" delay="500">
        Copier les blocs
      </b-tooltip>
      <b-tooltip target="toolbar-paste" placement="bottom" delay="500">
        Coller les blocs
      </b-tooltip>
      <b-tooltip target="toolbar-python" placement="bottom" delay="500">
        Copier le code python
      </b-tooltip>
      <b-tooltip target="toolbar-undo" placement="bottom" delay="500">
        Annuler l'action de blocs
      </b-tooltip>
      <b-tooltip target="toolbar-redo" placement="bottom" delay="500">
        Refaire l'action de blocs
      </b-tooltip>
    </b-button-toolbar>
  </div>
</template>

<script>
  import IconBase from '../IconBase.vue'
  import IconBug from '../Icon/IconBug.vue'
  import IconNew from '../Icon/IconNew.vue'
  import IconSave from '../Icon/IconSave.vue'
  import IconLoad from '../Icon/IconLoad.vue'
  import IconUndoRedo from '../Icon/IconUndoRedo.vue'
  import IconCopyPaste from '../Icon/IconCopyPaste.vue'
  import IconCopyPython from '../Icon/IconCopyPython.vue'
  
  export default {
    name: 'page-toolbar',
    data: function () {
      return {
        activeElement: null,
        workspace: null
      }
    },
    components: {
      IconBase,
      IconBug,
      IconNew,
      IconLoad,
      IconSave,
      IconUndoRedo,
      IconCopyPaste,
      IconCopyPython
    },
    methods: {
      doSite: function (url) {
        if (this.electron && this.electron.shell) {
          this.electron.shell.openExternal(url)
        } else {
          var win = window.open(url, '_blank')
          win.focus()
        }
      },
      canUndo: function () {
        console.log(eYo.App.workspace.undoStack_.length)
        return eYo.App.workspace && (eYo.App.workspace.undoStack_.length > 0)
      },
      canRedo: function () {
        return eYo.App.workspace && (eYo.App.workspace.redoStack_.length > 0)
      },
      doUndo: function () {
        eYo.App.workspace.undo()
      },
      doRedo: function () {
        eYo.App.workspace.undo(true)
      },
      doCopy: function () {
        window.Blockly.selected && window.Blockly.copy_(window.Blockly.selected)
      },
      doPaste: function () {
        window.Blockly.clipboardXml_ && eYo.App.workspace.paste(window.Blockly.clipboardXml_)
      },
      doCopyPythonCode: function () {
        var block = window.Blockly.selected
        if (block) {
          var p = new window.eYo.PythonExporter()
          var code = p.export(block, true)
          window.eYo.App.copyTextToClipboard(code)
        }
      },
      doNew: function () {
        eYo.App.bus.$emit('new-document')
        eYo.App.workspace.clearUndo()
      },
      doOpen: function () {
        this.doNew()
        // const {dialog} = require('electron').remote
        const remote = require('electron').remote
        const app = remote.app
        let documentsFolder = app.getPath('documents')
        let path = require('path')
        var defaultPath = path.join(documentsFolder, 'Edython')
        var fs = require('fs')
        if (!fs.existsSync(defaultPath)) {
          fs.mkdirSync(defaultPath)
        }
        remote.dialog.showOpenDialog({
          defaultPath: defaultPath,
          filters: [{
            name: 'Edython', extensions: ['eyo']
          }],
          properties: [
            'openFile'
          ]
        }, (fileNames) => {
          var fileName = fileNames[0]
          if (fileName === undefined) {
            console.log('Opération annulée')
            return
          }
          fs.readFile(fileName, (err, content) => {
            if (err) {
              alert('An error ocurred reading the file ' + err.message)
              return
            }
            // let dom = eYo.Xml.workspaceToDom(eYo.App.workspace, true)
            // let oSerializer = new XMLSerializer()
            // let content = oSerializer.serializeToString(dom)
            // let deflate = this.pako.gzip(content) // use gzip to ungzip from the CLI
            let inflate = this.pako.ungzip(content, {to: 'string'}) // use gzip to ungzip from the CLI
            var parser = new DOMParser()
            try {
              var dom = parser.parseFromString(inflate, 'application/xml')
              eYo.Xml.domToWorkspace(dom.documentElement, eYo.App.workspace)
            } catch (err) {
              console.log('ERROR:', err)
            }
          })
        })
      },
      doSave: function () {
        let dom = eYo.Xml.workspaceToDom(eYo.App.workspace, true)
        let oSerializer = new XMLSerializer()
        let content = oSerializer.serializeToString(dom)
        let deflate = this.pako.gzip(content) // use gzip to ungzip from the CLI

        const {dialog} = require('electron').remote

        const remote = require('electron').remote
        const app = remote.app
        let documentsFolder = app.getPath('documents')
        let path = require('path')
        var defaultPath = path.join(documentsFolder, 'Edython')
        var fs = require('fs')
        if (!fs.existsSync(defaultPath)) {
          fs.mkdirSync(defaultPath)
        }
        defaultPath = path.join(defaultPath, 'Sans titre.eyo')
        dialog.showSaveDialog({
          defaultPath: defaultPath,
          filters: [{
            name: 'Edython', extensions: ['eyo']
          }]
        }, (fileName) => {
          if (fileName === undefined) {
            console.log('Opération annulée')
            return
          }
          var dirname = path.dirname(fileName)
          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname)
          }
          // var fs = require('fs') // Load the File System to execute our common tasks (CRUD)
          fs.writeFile(fileName, deflate, (err) => {
            if (err) {
              alert('An error ocurred creating the file ' + err.message)
            }
            // alert("The file has been succesfully saved")
          })
        })
      }
    }
  }
</script>
<style>
#toolbar {
  padding: 0.25rem;
  text-align:center;
  height: 3rem;
}
#toolbar .btn {
  padding: 0rem 0.5rem;
  height: 2.5rem;
  vertical-align:middle;
}
</style>
