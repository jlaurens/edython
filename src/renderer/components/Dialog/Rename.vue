<template>
  <b-modal
    id="dialog-document-rename"
    ref="modal"
    :title="$$t('panel.document-rename.title')"
    @ok="handleOk"
    @shown="clearName"
    @hidden="clear"
    :ok-disabled="!nameState">
    <form @submit.stop.prevent="handleSubmit">
      <b-form-input
        type="text"
        :state="nameState"
        :placeholder="$$t('panel.document-rename.placeholder')"
        v-model="name"></b-form-input>
    </form>
  </b-modal>
</template>

<script>
  import {mapState, mapMutations} from 'vuex'

  export default {
    name: 'modal',
    data () {
      return {
        name: ''
      }
    },
    mounted () {
      this.$root.$on('document-rename',
        this.rename.bind(this)
      )
    },
    computed: {
      ...mapState('Document', [
        'path'
      ]),
      nameState () {
        return this.name.length > 0
      }
    },
    methods: {
      ...mapMutations('Document', [
        'setPath'
      ]),
      rename (callback) {
        this.callback = callback
        this.$refs.modal.show()
      },
      clearName () {
        this.name = ''
      },
      clear () {
        this.callback = null
        this.clearName()
      },
      handleOk (evt) {
        // Prevent modal from closing
        evt.preventDefault()
        this.handleSubmit()
      },
      handleSubmit () {
        const path = require('path')
        var newName = this.name
        if (!path.isAbsolute(newName)) {
          if (this.path) {
            newName = path.join(path.dirname(newName), this.name)
          }
        }
        this.setPath(newName)
        var callback = this.callback
        this.$refs.modal.hide()
        callback && callback(newName)
      }
    }
  }
</script>
<style>
</style>
