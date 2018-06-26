<template>
  <div id="toolbar">
    <b-button-toolbar key-nav  aria-label="Main toolbar" justify>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-site" v-on:click=" doSite('https://github.com/jlaurens/edython/')" title="Aller au site Edython" v-tippy>
          <img src="static/icon.svg" height="32" alt="Edython"/>
        </b-btn>
        <b-btn id="toolbar-debug" v-on:click="doSite('https://github.com/jlaurens/edython/issues')" title="Demander une correction, une amélioration" v-tippy>
          <icon-base :width="32" :height="32" icon-name="bug"><icon-bug /></icon-base>
        </b-btn>
        <b-dropdown-demo/>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-new" v-on:click="doNew()" title="Nouveau" v-tippy>
          <icon-base :width="32" :height="32" icon-name="new"><icon-new /></icon-base>
        </b-btn>
        <b-btn id="toolbar-open" v-on:click="doOpen()" title="Ouvrir" v-tippy>
            <icon-base :width="32" :height="32" icon-name="load"><icon-save-load variant="load" /></icon-base>
        </b-btn>
        <b-btn id="toolbar-save" v-on:click="doSave()" title="Sauvegarder" v-tippy>
          <icon-base :width="32" :height="32" icon-name="save"><icon-save-load variant="save" :step="saveStep"/></icon-base>
        </b-btn>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn-undo-redo :redo="false" />
        <b-btn-undo-redo :redo="true" />
      </b-button-group>
      <b-button-group class="mx-1">
        <b-button-copy-paste :copy="true" :deep="false" />
        <b-button-copy-paste :copy="true" :deep="true" />
        <b-button-copy-paste :copy="false" />
        <b-btn id="toolbar-python" v-on:click="doCopyPythonCode()" title="Copier le code python" v-tippy>
          <icon-base :width="32" :height="32" icon-name="copy Python"><icon-copy-python /></icon-base>
        </b-btn>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-back" v-on:click="doBack()" title="Sélection à l'arrière plan" v-tippy>
          <icon-base :width="32" :height="32" icon-name="back"><icon-front-back variant="back" /></icon-base>
        </b-btn>
        <b-btn id="toolbar-focus" v-on:click="doFocus()" title="Montrer la sélection" v-tippy>
          <icon-base :width="32" :height="32" icon-name="focus"><icon-focus/></icon-base>
        </b-btn>
      </b-button-group>
      <!--b-button-group class="mx-1">
        <b-btn id="toolbar-toggle-panels" v-on:click="doTogglePanelsVisible()" :title="toolbarTogglePanelsTitle" v-tippy>
          <icon-base :width="32" :height="32" icon-name="toggle"><icon-toggle-panels :variant="showTogglePanel" /></icon-base>
        </b-btn>
      </b-button-group-->
      <b-dropdown-menu />
    </b-button-toolbar>
  </div>
</template>

<script>
  import ToolbarMenu from './Toolbar/Menu.vue'
  import ToolbarUndoRedo from './Toolbar/UndoRedo.vue'
  import ToolbarDemo from './Toolbar/Demo.vue'
  import CopyPaste from './Toolbar/CopyPaste.vue'
  
  import IconBase from '@@/IconBase.vue'
  import IconBug from '@@/Icon/IconBug.vue'
  import IconNew from '@@/Icon/IconNew.vue'
  import IconSaveLoad from '@@/Icon/IconSaveLoad.vue'
  import IconCopyPython from '@@/Icon/IconCopyPython.vue'
  import IconFrontBack from '@@/Icon/IconFrontBack.vue'
  import IconFocus from '@@/Icon/IconFocus.vue'
  import IconTogglePanels from '@@/Icon/IconTogglePanels.vue'

  export default {
    name: 'page-toolbar',
    data: function () {
      return {
        selected: 'console',
        titles: {
          console: 'Console',
          turtle: 'Tortue'
        },
        saveStep: 1
      }
    },
    components: {
      IconBase,
      IconBug,
      IconNew,
      IconSaveLoad,
      IconCopyPython,
      IconFrontBack,
      IconFocus,
      IconTogglePanels,
      'b-dropdown-menu': ToolbarMenu,
      'b-btn-undo-redo': ToolbarUndoRedo,
      'b-dropdown-demo': ToolbarDemo,
      'b-button-copy-paste': CopyPaste
    },
    computed: {
      showTogglePanel () {
        return this.$store.state.UI.panelsVisible ? 'hide' : 'show'
      },
      toolbarTogglePanelsTitle () {
        return this.$store.state.UI.panelsVisible
          ? 'Cacher les consoles'
          : 'Afficher les consoles'
      }
    },
    mounted: function () {
    },
    methods: {
      doSite (url) {
        if (this.electron && this.electron.shell) {
          this.electron.shell.openExternal(url)
        } else {
          var win = window.open(url, '_blank')
          win.focus()
        }
      },
      doCopyPythonCode: function () {
        var block = Blockly.selected
        if (block) {
          var p = new eYo.PythonExporter()
          var code = p.export(block, true)
          eYo.App.copyTextToClipboard(code)
        }
      },
      doNew: function () {
        this.$$.bus.$emit('new-document')
        eYo.App.workspace.clearUndo()
        self.documentPath = undefined
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
            var inflate
            try {
              // is it compressed ?
              inflate = this.pako.ungzip(content) // use gzip to ungzip from the CLI
            } catch (err) {
              // I guess not
              inflate = content
            }
            try {
              console.log('1', inflate)
              eYo.App.workspace.eyo.fromUTF8ByteArray(inflate)
            } catch (err) {
              console.error('ERROR:', err)
            }
          })
        })
      },
      doSave: function () {
        let content = '<?xml version="1.0" encoding="utf-8"?>' + eYo.App.workspace.eyo.toString(true)
        let deflate = this.$store.state.Pref.ecoSave ? this.pako.gzip(content) : content // use gzip to ungzip from the CLI
        var fs = require('fs')
        var self = this
        if (this.documentPath) {
          fs.writeFile(this.documentPath, deflate, function (err) {
            if (err) {
              alert('An error ocurred creating the file ' + err.message)
            } else {
              self.$store.commit('UI_STAGE_UNDO')
              self.saveStep = 0
              self.TweenLite.to(self, 0.5, {saveStep: 1})
            }
          })
        } else {
          const {dialog} = require('electron').remote
          const remote = require('electron').remote
          const app = remote.app
          let documentsFolder = app.getPath('documents')
          let path = require('path')
          var defaultPath = path.join(documentsFolder, 'Edython')
          if (!fs.existsSync(defaultPath)) {
            fs.mkdirSync(defaultPath)
          }
          defaultPath = path.join(defaultPath, 'Sans titre.eyo')
          dialog.showSaveDialog({
            defaultPath: defaultPath,
            filters: [{
              name: 'Edython', extensions: ['eyo']
            }]
          }, function (filePath) {
            if (filePath === undefined) {
              console.log('Opération annulée')
              return
            }
            var dirname = path.dirname(filePath)
            if (!fs.existsSync(dirname)) {
              fs.mkdirSync(dirname)
            }
            // var fs = require('fs') // Load the File System to execute our common tasks (CRUD)
            fs.writeFile(filePath, deflate, (err) => {
              if (err) {
                alert('An error ocurred creating the file ' + err.message)
              } else {
                self.documentPath = filePath
                self.$store.commit('UI_STAGE_UNDO')
                self.saveStep = 0
                self.TweenLite.to(self, 0.5, {saveStep: 1})
              }
              // alert("The file has been succesfully saved")
            })
          })
        }
      },
      doFront () {
        eYo.App.doFront()
      },
      doBack () {
        eYo.App.doBack()
      },
      doFocus () {
        eYo.App.doFocus()
      },
      doTogglePanelsVisible () {
        this.$store.commit('UI_SET_PANELS_VISIBLE', !this.$store.state.UI.panelsVisible)
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
