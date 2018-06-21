<template>
  <div id="toolbar">
    <b-button-toolbar key-nav  aria-label="Main toolbar">
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
          <icon-base width="32" height="32" icon-name="save"><icon-save-load variant="save" /></icon-base>
        </b-btn>
        <b-btn id="toolbar-open" v-on:click="doOpen()" title="Ouvrir" v-tippy>
          <icon-base width="32" height="32" icon-name="load"><icon-save-load variant="load" /></icon-base>
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
        <b-btn id="toolbar-undo" v-on:click="doUndo()" :disabled="!canUndo" title="Annuler l'action de blocs" v-tippy>
          <icon-base width="32" height="32" icon-name="undo"><icon-undo-redo variant="undo"/></icon-base>
        </b-btn>
        <b-btn id="toolbar-redo" v-on:click="doRedo()" :disabled="!canRedo" title="Refaire l'action de blocs" v-tippy>
          <icon-base width="32" height="32"  icon-name="redo"><icon-undo-redo variant="redo"/></icon-base>
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
            xml: [
              '<edython xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0">',
              '<workspace>',
              '<content>',
              '<s eyo="start_stmt" x="300" y="120">',
              '<s eyo="print" flow="next">',
              '<x eyo="list" slot="arguments">',
              '<x eyo="literal" slot="O">\'Bonjour le monde!\'</x>',
              '</x>',
              '</s>',
              '</s>',
              '</content>',
              '</workspace>',
              '</edython>'
            ].join('')
          }, {
            title: 'Bonjour...',
            xml: [
              '<edython xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0">',
              '<workspace>',
              '<content>',
              '<s eyo="start_stmt" x="300" y="200">',
              '<s eyo="assignment" name="prénom" flow="next">',
              '<x eyo="list" slot="assigned">',
              '<x eyo="input" slot="O">',
              '<x eyo="literal" slot="expression">\'Quel est votre prénom ?\'</x>',
              '</x>',
              '</x>',
              '<s eyo="print" flow="next">',
              '<x eyo="list" slot="arguments">',
              '<x eyo="literal" slot="O">\'Bonjour\'</x>',
              '<x eyo="identifier" name="prénom" slot="f">',
              '</x>',
              '</x>',
              '</s>',
              '</s>',
              '</s>',
              '</content>',
              '</workspace>',
              '</edython>'
            ].join('')
          }, {
            title: 'Somme des entiers',
            xml: [
              '<edython xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0">',
              '<workspace>',
              '<content>',
              '<s eyo="start_stmt" x="300" y="280" comment="Calculer 1+2+3+...">',
              '<s eyo="stmt" comment="1) Demander un nombre à l\'utilisateur" flow="next">',
              '<s eyo="assignment" name="réponse" flow="next">',
              '<x eyo="list" slot="assigned">',
              '<x eyo="input" slot="O">',
              '<x eyo="literal" slot="expression">\'Donner un nombre entier positif\'',
              '</x>',
              '</x>',
              '</x>',
              '<s eyo="stmt" comment="2) Convertir la réponse en nombre entier" flow="next">',
              '<s eyo="assignment" name="n" flow="next">',
              '<x eyo="list" slot="assigned">',
              '<x eyo="call" name="int" slot="O">',
              '<x eyo="identifier" name="réponse" slot="unary">',
              '</x>',
              '</x>',
              '</x>',
              '<s eyo="stmt" comment="3) Initialiser la somme à 0" flow="next">',
              '<s eyo="assignment" name="somme" flow="next">',
              '<x eyo="list" slot="assigned">',
              '<x eyo="literal" slot="O">0',
              '</x>',
              '</x>',
              '<s eyo="stmt" comment="4) Calculer la somme" flow="next">',
              '<s eyo="for" flow="next">',
              '<x eyo="list" slot="for">',
              '<x eyo="identifier" name="i" slot="O">',
              '</x>',
              '</x>',
              '<x eyo="list" slot="in">',
              '<x eyo="range" slot="O">',
              '<x eyo="list" slot="arguments">',
              '<x eyo="a_expr" operator="+" slot="O">',
              '<x eyo="identifier" name="n" slot="lhs">',
              '</x>',
              '<x eyo="literal" slot="rhs">1',
              '</x>',
              '</x>',
              '</x>',
              '</x>',
              '</x>',
              '<s eyo="assignment" name="somme" flow="suite">',
              '<x eyo="list" slot="assigned">',
              '<x eyo="a_expr" operator="+" slot="O">',
              '<x eyo="identifier" name="somme" slot="lhs">',
              '</x>',
              '<x eyo="identifier" name="i" slot="rhs">',
              '</x>',
              '</x>',
              '</x>',
              '</s>',
              '<s eyo="stmt" comment="5) Afficher le résultat" flow="next">',
              '<s eyo="print" flow="next">',
              '<x eyo="list" slot="arguments">',
              '<x eyo="literal" slot="O">\'La somme des\'',
              '</x>',
              '<x eyo="identifier" name="n" slot="f">',
              '</x>',
              '<x eyo="literal" slot="o">\'premiers entiers est\'',
              '</x>',
              '<x eyo="identifier" name="somme" slot="x">',
              '</x>',
              '</x>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</content>',
              '</workspace>',
              '</edython>'
            ].join('')
          }, {
            title: '50 dés',
            xml: [
              '<edython xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0">',
              '<workspace>',
              '<content>',
              '<s eyo="start_stmt"  x="300" y="280" comment="50 lancers d\'un dé à 6 faces">',
              '<s eyo="random+import" flow="next">',
              '<s eyo="for" flow="next">',
              '<x eyo="list" slot="for">',
              '<x eyo="identifier" name="lancer" slot="O">',
              '</x>',
              '</x>',
              '<x eyo="list" slot="in">',
              '<x eyo="range" slot="O">',
              '<x eyo="list" slot="arguments">',
              '<x eyo="literal" slot="O">50</x>',
              '</x>',
              '</x>',
              '</x>',
              '<s eyo="print" flow="suite">',
              '<x eyo="list" slot="arguments">',
              '<x eyo="literal" slot="O">\'lancer n°\'</x>',
              '<x eyo="identifier" name="lancer" slot="f">',
              '</x>',
              '<x eyo="literal" slot="r">\':\'</x>',
              '<x eyo="random__call_expr" name="randint" ary="2" slot="x">',
              '<x eyo="list" slot="binary">',
              '<x eyo="literal" slot="fstart">1</x>',
              '<x eyo="literal" slot="rend">6</x>',
              '</x>',
              '</x>',
              '</x>',
              '</s>',
              '</s>',
              '</s>',
              '</s>',
              '</content>',
              '</workspace>',
              '</edython>'
            ].join('')
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
      IconDemo
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
        demo.xml && eYo.App.workspace.eyo.fromString(demo.xml)
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
        console.log(eYo.App.workspace.undoStack_.length)
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
              console.log('ERROR:', err)
            }
          })
        })
      },
      doSave: function () {
        let content = eYo.App.workspace.eyo.toString(true)
        let deflate = content // this.pako.gzip(content) // use gzip to ungzip from the CLI

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
      },
      doFront () {
        eYo.App.doFront()
      },
      doBack () {
        eYo.App.doBack()
      },
      doFocus () {
        eYo.App.doFocus()
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
