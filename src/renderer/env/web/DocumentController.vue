<template>
  <b-modal
    ref="openDialog"
    :title="$$t('panel.document-open.title')">
    <b-form-file
    v-model="file"
    :state="!!file"
    :placeholder="$$t('panel.document-open.placeholder')"
    accept=".eyo"
    ref="input"
    ></b-form-file
  ></b-modal>
</template>
<script>
  import {mapState, mapMutations} from 'vuex'

  export default {
    name: 'document-controller',
    data: function () {
      return {
        file: undefined
      }
    },
    computed: {
      ...mapState('Document', [
        'path'
      ])
    },
    mounted () {
      // console.error('WEB DOCUMENT CONTROLLER MOUNT')
      this.input = this.$refs.input
      this.openDialog = this.$refs.openDialog
      this.$$onOnly('document-open', (evt, callback) => { // callback: (path) -> ()
        this.callback = callback
        // var doOpen = () => {
        //   eYo.App.Document.shouldSave(() => {
        //     var el = this.input
        //     if (el.fireEvent) {
        //       el.fireEvent('onclick')
        //     } else {
        //       var evObj = document.createEvent('Events')
        //       evObj.initEvent('click', true, false)
        //       el.dispatchEvent(evObj)
        //     }
        //     // el.click()
        //   })
        // }
        // for some reason, we cannot safely simulate a click on the input button.
        // I guess there is an interference with bootstrap
        // because it does work in more simple situations
        // Here is what we do instead
        // localizing the after element in bootstrap is quite a pain.
        var addRule = (style => {
          var sheet = document.head.appendChild(style).sheet
          return function (selector, css) {
            var propText = typeof css === 'string'
              ? css
              : Object.keys(css).map(p => `${p}:${p === 'content' ? `'${css[p]}'` : css[p]}`).join(';')
            sheet.insertRule(`${selector}{${propText}}`, sheet.cssRules.length)
          }
        })(document.createElement('style'))
        const xx = document.querySelector('.custom-file-label')
        if (xx) {
          var content = getComputedStyle(xx, ':after').content
          var expected = this.$$t('message.browse')
          if (content !== expected) {
            addRule('.custom-file-label::after', {
              content: this.$$t('message.browse')
            })
          }
        }
        this.input.reset()
        this.openDialog.show()
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
        var blob = new Blob([deflate.deflate], {type: deflate.ecoSave ? 'application/octet-stream' : 'text/plain;charset=utf-8'})
        FileSaver.saveAs(blob, basename)
        this.stageUndo()
        eYo.App.workspace.eyo.resetChangeCount()
        this.$root.$emit('document-save-complete')
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
      this.$$onOnly('document-save', doSave)
      this.$$onOnly('document-save-as', doSave)
    },
    methods: {
      ...mapMutations('Undo', [
        'stageUndo'
      ])
    },
    watch: {
      file (file, oldValue) {
        this.openDialog.hide()
        if (file) {
          this.$nextTick(() => {
            const reader = new FileReader()
            reader.onload = e => {
              var result = e.target.result
              var content = new Uint8Array(result)
              eYo.App.Document.readDeflate(content, file.name)
              this.stageUndo()
              eYo.App.workspace.eyo.resetChangeCount()
              this.$root.$emit('document-open-complete')
              eYo.$$.app.$nextTick(() => {
                eYo.Selected.selectOneBlockOf(eYo.App.workspace.topBlocks_, true)
                this.$root.$emit('pane-workspace-visible')
              })
            }
            // console.log(file)
            reader.readAsArrayBuffer(file)
            this.callback && this.callback()
          })
        } else {
          this.$root.$emit('document-open-abort')
        }
      }
    }
  }
</script>
<style>
</style>