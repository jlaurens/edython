<template>
  <b-modal
    id="dialog-document-rename"
    ref="modal"
    :title="$$t('panel.document-rename.title')"
    @ok="handleOk"
    @shown="clearName">
    <form @submit.stop.prevent="handleSubmit">
      <b-form-input
        type="text"
        placeholder="$$t('panel.document-rename.placeholder')"
        v-model="name"></b-form-input>
    </form>
  </b-modal>
</template>

<script>
  export default {
    name: 'modal',
    data () {
      return {
        name: '',
        names: []
      }
    },
    mounted () {
      this.$$.bus.$on('document-rename', this.rename.bind(this))
    },
    methods: {
      rename (callback) {
        this.callback = callback
        this.$refs.modal.show()
      },
      clearName () {
        this.name = ''
      },
      handleOk (evt) {
        // Prevent modal from closing
        evt.preventDefault()
        if (!this.name) {
          alert('Please enter your name')
        } else {
          this.handleSubmit()
        }
      },
      handleSubmit () {
        console.error('this.name', this.name)
        this.names.push(this.name)
        this.clearName()
        this.$refs.modal.hide()
        this.callback && this.callback(this.name)
      }
    }
  }
</script>
<style>
</style>
