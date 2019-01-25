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
      this.$root.$on('document-rename', this.rename.bind(this))
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
        try {
          if (this.callback) {
            this.callback(this.name)
          } else {
            const path = require('path')
            if (!path.isAbsolute(this.name)) {
              if (this.path) {
                this.setPath(path.join(path.dirname(this.path), this.name))
                return
              }
            }
            this.setPath(this.name)
          }
        } finally {
          this.$refs.modal.hide() // after
        }
      }
    }
  }
</script>
<style>
</style>
