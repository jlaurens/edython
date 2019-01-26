<template>
  <b-modal
    ref='dialog'
    id="page-modal-should-save"
    lazy
    @ok="doOk()"
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
    name: 'should-save',
    methods: {
      doYes () {
        this.$refs.dialog.hide()
        this.$root.$emit('document-save', () => {
          eYo.App.Document.doNew()
        })
      },
      doNo () {
        this.$refs.dialog.hide()
        eYo.App.workspace.eyo.resetChangeCount()
        eYo.App.Document.doNew()
      }
    }
  }
</script>
<style>
  .eyo-far-left {
    margin-left: 1rem;
  }
</style>
