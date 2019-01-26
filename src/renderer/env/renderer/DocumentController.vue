<template>
</template>
<script>
  import {mapState, mapMutations} from 'vuex'

  export default {
    name: 'document-controller',
    data: function () {
      return {
        documentPath_: undefined
      }
    },
    computed: {
      ...mapState('Document', [
        'path'
      ]),
      documentPath () {
        const fs = window.require('fs')
        if (!this.documentPath_) {
          // const {dialog} = require('electron').remote
          const remote = window.require('electron').remote
          const app = remote.app
          let documentsFolder = app.getPath('documents')
          this.documentPath_ = require('path').join(documentsFolder, 'Edython')
        }
        if (!fs.existsSync(this.documentPath_)) {
          fs.mkdirSync(this.documentPath_)
        }
        return this.documentPath_
      }
    },
    mounted () {
      const ipcRenderer = require('electron').ipcRenderer
      if (ipcRenderer) {
        // we *are* in electron
        ipcRenderer.on('new', eYo.App.Document.doNew)
        ipcRenderer.on('open', this.$$doOpen.bind(this))
        ipcRenderer.on('save', this.$$doSave.bind(this))
        ipcRenderer.on('saveas', this.$$doSaveAs.bind(this))
      } else {
        console.error('NO ipcRenderer')
      }
      this.$root.$on('document-open', this.$$doOpen.bind(this))
      this.$root.$on('document-save', this.$$doSave.bind(this))
      this.$root.$on('document-save-as', this.$$doSaveAs.bind(this))
    },
    methods: {
      ...mapMutations('Document', [
        'setPath'
      ]),
      ...mapMutations('Undo', [
        'stageUndo'
      ]),
      $$readFile (fileName, callback) {
        const fs = window.require('fs')
        fs.readFile(fileName, (err, content) => {
          if (err) {
            alert('An error ocurred reading the file ' + err.message)
            return
          }
          this.setPath(fileName)
          eYo.App.Document.readDeflate(content, fileName) // setPath here instead ?
          eYo.App.workspace.eyo.resetChangeCount()
          if (callback) {
            callback()
          } else {
            this.$nextTick(() => {
              eYo.Selected.selectOneBlockOf(eYo.App.workspace.topBlocks_, true)
              this.before()
            })
          }
        })
      },
      before () {
        eYo.$$.bus.$emit('pane-workspace-visible')
      },
      $$doOpen (ev, callback) {
        this.before()
        const {dialog} = require('electron').remote
        dialog.showOpenDialog({
          defaultPath: this.documentPath,
          filters: [{
            name: 'Edython', extensions: ['eyo']
          }],
          properties: [
            'openFile'
          ]
        }, (fileNames) => {
          var fileName = fileNames && fileNames[0]
          if (fileName) {
            this.$$readFile(fileName, callback)
          } else {
            console.log('Opération annulée')
          }
        })
      },
      $$doSaveAs (ev, callback) {
        this.before()
        const path = require('path')
        var defaultPath = path.join(this.documentPath, this.$$t('message.document.Untitled') + '.eyo')
        const {dialog} = require('electron').remote
        dialog.showSaveDialog({
          defaultPath: defaultPath,
          filters: [{
            name: 'Edython', extensions: ['eyo']
          }]
        }, filePath => {
          if (filePath === undefined) {
            console.log('Opération annulée')
            eYo.$$.bus.$emit('document-save-cancel')
            callback && callback(filePath)
            return
          }
          var dirname = path.dirname(filePath)
          const fs = window.require('fs')
          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname)
          }
          this.setPath(filePath)
          this.$$writeContentToFile(filePath, callback)
        })
      },
      $$doSave (ev, callback) {
        this.before()
        if (this.path) {
          this.$$writeContentToFile(this.path, callback)
        } else {
          this.$$doSaveAs(ev, callback)
        }
      },
      $$writeContentToFile (path, callback) {
        const fs = window.require('fs')
        let deflate = eYo.App.Document.getDeflate()
        fs.writeFile(path, deflate, err => {
          if (err) {
            alert('An error ocurred creating the file ' + err.message)
            eYo.$$.bus.$emit('document-save-fail')
          } else {
            this.stageUndo()
            eYo.App.workspace.eyo.resetChangeCount()
            eYo.$$.bus.$emit('document-save-complete')
            callback && callback(path)
          }
        })
      }
    }
  }
</script>
<style>
</style>



