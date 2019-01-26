<template>
  <b-modal
    ref='dialog'
    id="document-read-string-recovered"
    lazy
    @ok="doOk()"
    :title="$$t('panel.document-read-string-recovered.title')"
    >
    <div
      class="d-block">{{$$t('panel.document-read-string-recovered.content')}}</div>
    <div
      slot="modal-footer"
      class="w-100">
      <b-btn
        size="sm"
        class="float-right eyo-far-left"
        variant="primary"
        @click="doYes()">{{$$t('message.OK')}}</b-btn>
    </div>
  </b-modal>
</template>

<script>
  export default {
    name: 'document-read-string-recovered',
    methods: {
      show () {
        this.$refs.dialog.show()
      },
      doYes () {
        this.$refs.dialog.hide()
      }
    }
  }
</script>
<style>
</style>
