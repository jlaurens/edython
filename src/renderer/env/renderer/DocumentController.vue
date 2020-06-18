<template>
  <div />
</template>
<script>
import {mapState, mapMutations} from 'vuex'

export default {
    name: 'DocumentController',
    data () {
        return {
        }
    },
    computed: {
        ...mapState('Document', [
            'path'
        ]),
        documentPath () {
            // const {dialog} = require('electron').remote
            let remote = window.require('electron').remote
            let app = remote.app
            let documentsFolder = app.getPath('documents')
            let path = require('path').join(documentsFolder, 'Edython')
            let fs = window.require('fs')
            fs.existsSync(path) || fs.mkdirSync(path)
            return path
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
        this.$$onOnly('document-open', (evt, callback) => { // callback: (path) -> ()
            eYo.App.Document.shouldSave(() => {
                this.$$doOpen(evt, callback)
            })
        })
        this.$$onOnly('document-save',
            this.$$doSave.bind(this)
        )
        this.$$onOnly('document-save-as',
            this.$$doSaveAs.bind(this)
        )
    },
    methods: {
        ...mapMutations('Document', [
            'setPath'
        ]),
        ...mapMutations('Undo', [
            'stageUndo'
        ]),
        before () {
            this.$root.$emit('pane-workspace-visible')
        },
        $$doOpen (evt, callback) { // callback: (path) -> undefined
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
                    const fs = window.require('fs')
                    fs.readFile(fileName, (err, content) => {
                        if (err) {
                            alert('An error ocurred reading the file ' + err.message)
                            return
                        }
                        this.setPath(fileName)
                        eYo.App.Document.readDeflate(content, fileName) // setPath here instead ?
                        this.stageUndo()
                        eYo.App.workspace.eyo.resetChangeCount()
                        this.$root.$emit('document-open-complete')
                        if (callback) {
                            callback(fileName)
                        } else {
                            this.$nextTick(() => {
                                eYo.Selected.selectOneBlockOf(eYo.App.workspace.topBlocks_, true)
                                this.before()
                            })
                        }
                    })
                } else {
                    this.$root.$emit('document-open-abort')
                }
            })
        },
        $$doSaveAs (evt, callback) { // callback: evt, path -> undefined
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
                    console.log('Operation canceled')
                    this.$root.$emit('document-save-abort')
                    callback && callback(evt, filePath)
                    return
                }
                var dirname = path.dirname(filePath)
                const fs = window.require('fs')
                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname)
                }
                this.setPath(filePath)
                this.$$writeContentToFile(
                    filePath,
                    callback && ((path) => callback(evt, path))
                )
            })
        },
        $$doSave (evt, callback) { // callback: evt, path -> undefined
            this.before()
            if (this.path) {
                this.$$writeContentToFile(
                    this.path,
                    callback && (path => callback(evt, path))
                )
            } else {
                this.$$doSaveAs(evt, callback)
            }
        },
        $$writeContentToFile (path, callback) { // callback: path -> undefined
            const fs = window.require('fs')
            let deflate = eYo.App.Document.getDeflate().deflate
            fs.writeFile(path, deflate, err => {
                if (err) {
                    alert('An error ocurred creating the file ' + err.message)
                    this.$root.$emit('document-save-abort')
                } else {
                    this.stageUndo()
                    eYo.App.workspace.eyo.resetChangeCount()
                    this.$root.$emit('document-save-complete')
                    callback && callback(path)
                }
            })
        }
    }
}
</script>
<style>
</style>



