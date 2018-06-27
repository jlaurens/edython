<template>
  <b-button-group class="mx-1">
    <b-btn id="toolbar-new" v-on:click="doNew()" title="Nouveau" v-tippy>
      <icon-base :width="32" :height="32" icon-name="new"><icon-new /></icon-base>
    </b-btn>
    <b-btn id="toolbar-open" v-on:click="doOpen()" title="Ouvrir" v-tippy>
        <icon-base :width="32" :height="32" icon-name="load"><icon-save-load variant="load" /></icon-base>
    </b-btn>
    <b-btn id="toolbar-save" v-on:click="doSave()" title="Sauvegarder" v-tippy>
      <icon-base :width="32" :height="32" icon-name="save"><icon-save-load variant="save" :step="step"/></icon-base>
    </b-btn>
  </b-button-group>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
  import IconNew from '@@/Icon/IconNew.vue'
  import IconSaveLoad from '@@/Icon/IconSaveLoad.vue'
  
  export default {
    name: 'page-toolbar-new-load-save',
    data: function () {
      return {
        step: 1,
        documentPath: undefined
      }
    },
    components: {
      IconBase,
      IconNew,
      IconSaveLoad
    },
    methods: {
      doNew: function () {
        this.$$.bus.$emit('new-document')
        eYo.App.workspace.clearUndo()
        this.documentPath = undefined
        this.$store.commit('UI_STAGE_UNDO')
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
        var self = this // eslint-disable-line no-unused-vars
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
            // let deflate = this.$pako.gzip(content) // use gzip to ungzip from the CLI
            var inflate
            try {
              // is it compressed ?
              inflate = this.$pako.ungzip(content) // use gzip to ungzip from the CLI
            } catch (err) {
              // I guess not
              inflate = content
            }
            try {
              eYo.App.workspace.eyo.fromUTF8ByteArray(inflate)
              self.documentPath = fileName
            } catch (err) {
              console.error('ERROR:', err)
            }
          })
        })
      },
      doSave: function () {
        let content = '<?xml version="1.0" encoding="utf-8"?>' + eYo.App.workspace.eyo.toString(true)
        let deflate = this.$store.state.Pref.ecoSave ? this.$pako.gzip(content) : content // use gzip to ungzip from the CLI
        var fs = require('fs')
        var self = this
        if (this.documentPath) {
          fs.writeFile(this.documentPath, deflate, function (err) {
            if (err) {
              alert('An error ocurred creating the file ' + err.message)
            } else {
              self.$store.commit('UI_STAGE_UNDO')
              self.step = 0
              self.TweenLite.to(self, 0.5, {step: 1})
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
                self.step = 0
                self.TweenLite.to(self, 0.5, {step: 1})
              }
              // alert("The file has been succesfully saved")
            })
          })
        }
      }
    }
  }
</script>
