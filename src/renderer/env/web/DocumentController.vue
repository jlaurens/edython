<template>
  <div
    id="web-load">
    <input
      ref="input"
      type="file"
      @change="loadTextFromFile"
      style="display:none">
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
      this.$root.$on('document-open', () => {
        this.showAlert = false
        this.$refs.input.click()
      })
      this.$root.$on('document-save', this.$$doSaveAs.bind(this))
      this.$root.$on('document-save-as', this.$$doSaveAs.bind(this))
    },
    methods: {
      ...mapMutations('Document', [
        'setPath'
      ]),
      ...mapMutations('Undo', [
        'stageUndo'
      ]),
      loadTextFromFile (ev) {
        const file = ev.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = e => {
            var result = e.target.result
            var content = new Uint8Array(result)
            eYo.App.Document.readDeflate(content, file)
            eYo.$$.app.$nextTick(() => {
              eYo.Selected.selectOneBlockOf(eYo.App.workspace.topBlocks_, true)
              eYo.$$.bus.$emit('pane-workspace-visible')
            })
          }
          // console.log(file)
          reader.readAsArrayBuffer(file)
        }
      },
      doSaveAs: (() => {
        var do_it = (ev, callback) => {
          var p = this.path
          var basename = p && p.lastIndexOf
            ? p.substr(p.lastIndexOf('/') + 1)
            : this.$$t('message.document.Untitled')
          if (!basename.endsWith('.eyo')) {
            basename = basename + '.eyo'
          }
          let deflate = eYo.App.Document.getDeflate()
          var file = new File([deflate], basename, {type: 'application/octet-stream'})
          FileSaver.saveAs(file)
          callback && callback()
        }
        return (ev, callback) => {
          var p = this.path
          if (p && p.lastIndexOf) {
            do_it(ev, callback)
          } else {
            this.$root.$emit('document-rename', name => {
              do_it(ev, callback)
            })
          }
        }
      })()
    }
  }
</script>
<style>
</style>