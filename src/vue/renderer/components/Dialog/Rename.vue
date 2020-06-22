<template>
  <b-modal
    id="dialog-document-rename"
    ref="modal"
    :title="$$t('panel.document-rename.title')"
    :ok-disabled="!nameState"
    @ok="handleOk"
    @shown="clearName"
    @hidden="clear"
  >
    <form @submit.stop.prevent="handleSubmit">
      <b-form-input
        v-model="name"
        type="text"
        :state="nameState"
        :placeholder="$$t('panel.document-rename.placeholder')"
      />
    </form>
  </b-modal>
</template>

<script>
import {mapState, mapMutations} from 'vuex'

export default {
  name: 'Modal',
  data () {
    return {
      name: ''
    }
  },
  computed: {
    ...mapState('Document', [
      'path'
    ]),
    nameState () {
      return this.name.length > 0
    }
  },
  mounted () {
    this.$$onOnly('document-rename',
      this.rename.bind(this)
    )
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
