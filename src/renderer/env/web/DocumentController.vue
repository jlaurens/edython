<template>
  <b-modal
    id="document-open"
    ref="dialog"
    @hidden="doHidden">
    <input
      ref="input"
      type="file"
      @change="loadTextFromFile">
  </b-modal>
  <div
    id="web-load">
  </div>
</template>
<script>
  import {mapState, mapMutations} from 'vuex'

  export default {
    name: 'document-controller',
    data: function () {
      return {
      }
    },
    computed: {
      ...mapState('Document', [
        'path'
      ])
    },
    mounted () {
      this.$root.$on('document-open', (evt, callback) => { // callback: (path) -> ()
        eYo.App.Document.shouldSave(() => {
          this.callback = callback
          this.$refs.dialog.show()
          this.$refs.input.click()
        })
      })
      var do_it = (evt, callback) => { // callback: (path) -> ()
        var p = this.path
        var basename = p && p.lastIndexOf
          ? p.substr(p.lastIndexOf('/') + 1)
          : this.$$t('message.document.Untitled')
        if (!basename.endsWith('.eyo')) {
          basename = basename + '.eyo'
        }
        let deflate = eYo.App.Document.getDeflate()
        var FileSaver = require('file-saver')
        // var file = new File([deflate], basename, {type: 'application/octet-stream'})
        // FileSaver.saveAs(file)
        var blob = new Blob([deflate], {type: 'text/plain;charset=utf-8'})
        FileSaver.saveAs(blob, basename)
        callback && callback(basename)
      }
      var doSave = (evt, callback) => { // callback: (path) -> ()
        var p = this.path
        if (p && p.lastIndexOf) {
          do_it(evt, callback)
        } else {
          this.$root.$emit('document-rename', name => {
            do_it(evt, callback)
          })
        }
      }
      this.$root.$on('document-save', doSave)
      this.$root.$on('document-save-as', doSave)
    },
    methods: {
      ...mapMutations('Undo', [
        'stageUndo'
      ]),
      loadTextFromFile (evt) {
        const file = evt.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = e => {
            var result = e.target.result
            var content = new Uint8Array(result)
            eYo.App.Document.readDeflate(content, file.name)
            eYo.$$.app.$nextTick(() => {
              eYo.Selected.selectOneBlockOf(eYo.App.workspace.topBlocks_, true)
              eYo.$$.bus.$emit('pane-workspace-visible')
            })
          }
          // console.log(file)
          reader.readAsArrayBuffer(file)
          this.callback && this.callback()
        }
      },
      doHidden () {
        this.$nextTick(() => {
          this.callback = undefined
        })
      }
    }
  }
</script>
<style>
</style>