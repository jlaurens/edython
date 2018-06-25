<template>
  <div id="toolbar">
    <b-button-toolbar key-nav  aria-label="Main toolbar" justify>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-site" v-on:click=" doSite('https://github.com/jlaurens/edython/')" title="Aller au site Edython" v-tippy>
          <img src="static/icon.svg" height="32" alt="Edython"/>
        </b-btn>
        <b-btn id="toolbar-debug" v-on:click="doSite('https://github.com/jlaurens/edython/issues')" title="Demander une correction, une amélioration" v-tippy>
          <icon-base width="32" height="32" icon-name="new"><icon-bug /></icon-base>
        </b-btn>
        <b-dropdown id="eyo-toolbar-dropdown-demo" class="eyo-dropdown" title="Démo" v-on:show="doSelectDemoShow()" v-on:hidden="doSelectDemoHidden()">
          <template slot="button-content">
            <icon-base width="32" height="32" icon-name="new"><icon-demo /></icon-base>
          </template>
          <b-dropdown-item-button v-for="(demo, index) in demos" v-on:click="doSelectDemo(index)" :style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight + 'px'}">{{demo.title}}</b-dropdown-item-button>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item-button v-on:click="selected = 'console'" :style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight + 'px'}">{{titles.console}}</b-dropdown-item-button>
          <b-dropdown-item-button v-on:click="selected = 'turtle'" v-bind:style="{fontFamily: eYo.Font.familySans, fontSize: eYo.Font.totalHeight}">{{titles.turtle}}</b-dropdown-item-button>
        </b-dropdown>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-new" v-on:click="doNew()" title="Nouveau" v-tippy>
          <icon-base width="32" height="32" icon-name="new"><icon-new /></icon-base>
        </b-btn>
        <b-btn id="toolbar-save" v-on:click="doSave()" title="Sauvegarder" v-tippy>
          <icon-base width="32" height="32" icon-name="save"><icon-save-load variant="save" step="0.5"/></icon-base>
        </b-btn>
        <b-btn id="toolbar-open" v-on:click="doOpen()" title="Ouvrir" v-tippy>
          <icon-base width="32" height="32" icon-name="load"><icon-save-load variant="load" /></icon-base>
        </b-btn>
      </b-button-group>
      <b-button-group class="mx-1">
          <b-btn id="toolbar-undo" v-on:click="doUndo()" :disabled="!canUndo" title="Annuler l'action de blocs" v-tippy>
            <icon-base width="32" height="32" icon-name="undo"><icon-undo-redo variant="undo"/></icon-base>
          </b-btn>
          <b-btn id="toolbar-redo" v-on:click="doRedo()" :disabled="!canRedo" title="Refaire l'action de blocs" v-tippy>
            <icon-base width="32" height="32"  icon-name="redo"><icon-undo-redo variant="redo"/></icon-base>
          </b-btn>
        </b-button-group>
        <b-button-group class="mx-1">
        <b-btn id="toolbar-copy" v-on:click="doSingleCopy()" title="Copier le bloc sélectionné" v-tippy>
          <icon-base width="32" height="32" icon-name="copy single"><icon-copy-paste variant="copy" single="true" /></icon-base>
        </b-btn>
        <b-btn id="toolbar-copy" v-on:click="doCopy()" title="Copier le bloc sélectionné et les suivants" v-tippy>
          <icon-base width="32" height="32" icon-name="copy"><icon-copy-paste variant="copy" single="false" /></icon-base>
        </b-btn>
        <b-btn id="toolbar-paste" v-on:click="doPaste()" title="Coller les blocs" v-tippy>
          <icon-base width="32" height="32" icon-name="paste"><icon-copy-paste variant="paste"/></icon-base>
        </b-btn>
        <b-btn id="toolbar-python" v-on:click="doCopyPythonCode()" title="Copier le code python" v-tippy>
          <icon-base width="32" height="32" icon-name="copy Python"><icon-copy-python /></icon-base>
        </b-btn>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-back" v-on:click="doBack()" title="Sélection à l'arrière plan" v-tippy>
          <icon-base width="32" height="32" icon-name="back"><icon-front-back variant="back" /></icon-base>
        </b-btn>
        <b-btn id="toolbar-focus" v-on:click="doFocus()" title="Montrer la sélection" v-tippy>
          <icon-base width="32" height="32" icon-name="focus"><icon-focus/></icon-base>
        </b-btn>
      </b-button-group>
      <!--b-button-group class="mx-1">
        <b-btn id="toolbar-toggle-panels" v-on:click="doTogglePanelsVisible()" :title="toolbarTogglePanelsTitle" v-tippy>
          <icon-base width="32" height="32" icon-name="back"><icon-toggle-panels :variant="showTogglePanel" /></icon-base>
        </b-btn>
      </b-button-group-->
    </b-button-toolbar>
  </div>
</template>

<script>
  import IconBase from '../IconBase.vue'
  import IconBug from '../Icon/IconBug.vue'
  import IconNew from '../Icon/IconNew.vue'
  import IconSaveLoad from '../Icon/IconSaveLoad.vue'
  import IconUndoRedo from '../Icon/IconUndoRedo.vue'
  import IconCopyPaste from '../Icon/IconCopyPaste.vue'
  import IconCopyPython from '../Icon/IconCopyPython.vue'
  import IconFrontBack from '../Icon/IconFrontBack.vue'
  import IconFocus from '../Icon/IconFocus.vue'
  import IconDemo from '../Icon/IconDemo.vue'
  import IconTogglePanels from '../Icon/IconTogglePanels.vue'
  
  import demoBasicHello from '@static/demo/basic/hello.xml'
  import demoBasicHelloYou from '@static/demo/basic/hello-you.xml'
  import demoBasicSumOfIntegers from '@static/demo/basic/sum-of-integers.xml'
  import demoBasicFiftyDices from '@static/demo/basic/fifty-dices.xml'
  import demoBasicList from '@static/demo/basic/list.xml'
  import demoBasicDebug from '@static/demo/basic/debug.xml'
  
  export default {
    name: 'page-toolbar',
    data: function () {
      return {
        activeElement: null,
        workspace: null,
        selected: 'console',
        titles: {
          console: 'Console',
          turtle: 'Tortue'
        },
        demos: [
          {
            title: 'Bonjour le monde!',
            xml: demoBasicHello
          }, {
            title: 'Bonjour ...',
            xml: demoBasicHelloYou
          }, {
            title: 'Somme des entiers',
            xml: demoBasicSumOfIntegers
          }, {
            title: '50 dés',
            xml: demoBasicFiftyDices
          }, {
            title: 'Liste',
            xml: demoBasicList
          }, {
            title: 'Debug',
            xml: demoBasicDebug
          }
        ]
      }
    },
    components: {
      IconBase,
      IconBug,
      IconNew,
      IconSaveLoad,
      IconUndoRedo,
      IconCopyPaste,
      IconCopyPython,
      IconFrontBack,
      IconFocus,
      IconDemo,
      IconTogglePanels
    },
    computed: {
      showTogglePanel: function () {
        return this.$store.state.UI.panelsVisible ? 'hide' : 'show'
      },
      toolbarTogglePanelsTitle: function () {
        return this.$store.state.UI.panelsVisible
          ? 'Cacher les consoles'
          : 'Afficher les consoles'
      }
    },
    mounted: function () {
      // add the tippy by hand if it does already exists
      var el = document.getElementById('eyo-toolbar-dropdown-demo')
      el._tippy || window.tippy(el, eYo.Tooltip.options)
      goog.asserts.assert(el._tippy)
    },
    methods: {
      doSelectDemo (index) {
        var demo = this.demos[index]
        // console.log(index, demo.xml)
        var parser = new DOMParser()
        var dom = parser.parseFromString(demo.xml, 'application/xml')
        // console.log(dom)
        dom && eYo.Xml.domToWorkspace(dom, eYo.App.workspace)
        demo && eYo.App.workspace.eyo.fromString(demo.xml)
      },
      doSelectDemoShow () {
        var el = document.getElementById('eyo-toolbar-dropdown-demo')
        !el._tippy.state.visible || el._tippy.hide()
        el._tippy.state.enabled = false
        eYo.Tooltip.hideAll(eYo.App.workspace.flyout_.svgGroup_)
      },
      doSelectDemoHidden () {
        var el = document.getElementById('eyo-toolbar-dropdown-demo')
        el._tippy.state.enabled = true
      },
      doSite (url) {
        if (this.electron && this.electron.shell) {
          this.electron.shell.openExternal(url)
        } else {
          var win = window.open(url, '_blank')
          win.focus()
        }
      },
      canUndo () {
        // console.log(eYo.App.workspace.undoStack_.length)
        return eYo.App.workspace && (eYo.App.workspace.undoStack_.length > 0)
      },
      canRedo () {
        return eYo.App.workspace && (eYo.App.workspace.redoStack_.length > 0)
      },
      doUndo () {
        eYo.App.workspace.undo()
      },
      doRedo () {
        eYo.App.workspace.undo(true)
      },
      doSingleCopy () {
        eYo.App.doCopy(true)
      },
      doCopy () {
        eYo.App.doCopy()
      },
      doPaste () {
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
            let inflate = content // this.pako.ungzip(content, {to: 'string'}) // use gzip to ungzip from the CLI
            try {
              eYo.App.workspace.eyo.fromString(inflate)
            } catch (err) {
              console.error('ERROR:', err)
            }
          })
        })
      },
      doSave: function () {
        let content = '<?xml version="1.0" encoding="utf-8"?>' + eYo.App.workspace.eyo.toString(true)
        let deflate = content // this.pako.gzip(content) // use gzip to ungzip from the CLI
        var fs = require('fs')
        var self = this
        if (this.documentPath) {
          fs.writeFile(this.documentPath, deflate, function (err) {
            if (err) {
              alert('An error ocurred creating the file ' + err.message)
            } else {
              self.$store.commit('STAGE_UNDO')
            }
            // alert("The file has been succesfully saved")
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
        this.$store.commit('SET_PANELS_VISIBLE', !this.$store.state.UI.panelsVisible)
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
