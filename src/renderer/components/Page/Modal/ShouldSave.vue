<template>
  <b-modal ref='shouldSaveModalRef' id="page-modal-should-save" lazy @ok="doOk()" :title='$$t("panel.should_save.title")'>
    <div class="d-block">{{$$t("panel.should_save.content")}}</div>
    <div slot="modal-footer" class="w-100">
      <b-btn size="sm" class="float-right eyo-far-left" variant="primary" @click="doYes()">
        {{$$t('message.YES')}}
      </b-btn>
      <b-btn size="sm" class="float-right" variant="secondary" @click="doNo()">
        {{$$t('message.NO')}}
      </b-btn>
    </div>
  </b-modal>
</template>

<script>
  export default {
    name: 'should-save',
    methods: {
      doYes () {
        this.$refs.shouldSaveModalRef.hide()
        eYo.App.Document.doSave(null, function () {
          eYo.App.Document.doNew()
        })
      },
      doNo () {
        this.$refs.shouldSaveModalRef.hide()
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
