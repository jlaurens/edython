<template>
  <b-modal
    ref="dialog"
    id="dialog-should-save"
    lazy
    @ok="doOk()"
    @hidden="doHidden()"
    :title='$$t("panel.should_save.title")'>
    <div
      class="d-block">{{$$t("panel.should_save.content")}}</div>
    <div
      slot="modal-footer"
      class="w-100">
      <b-btn
        size="sm"
        class="float-right eyo-far-left"
        variant="primary"
        @click="doYes()">{{$$t('message.YES')}}</b-btn>
      <b-btn
        size="sm"
        class="float-right"
        variant="secondary"
        @click="doNo()">{{$$t('message.NO')}}</b-btn>
    </div>
  </b-modal>
</template>

<script>
  export default {
    name: 'document-should-save',
    methods: {
      show (callback) { // callback: () -> ()
        this.callback = callback
        this.$refs.dialog.show()
      },
      doYes (evt) {
        this.$refs.dialog.hide()
        this.$root.$emit('document-save', evt, this.callback) // callback needed when just hidden
      },
      doNo (evt) {
        this.$refs.dialog.hide()
        console.log('doNo', this.callback)
        this.callback && this.callback()
      },
      doHidden (evt) {
        this.callback && this.$nextTick(() => {
          this.callback = undefined
        })
      }
    }
  }
</script>
<style>
  .eyo-far-left {
    margin-left: 1rem;
  }
</style>
