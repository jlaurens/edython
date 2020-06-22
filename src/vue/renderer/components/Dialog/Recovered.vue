<template>
  <b-modal
    id="document-read-string-recovered"
    ref="dialog"
    lazy
    :title="$$t('panel.document-read-string-recovered.title')"
    @ok="doOk()"
  >
    <div
      class="d-block"
      v-html="$$t('panel.document-read-string-recovered.content')"
    />
    <div
      slot="modal-footer"
      class="w-100"
    >
      <b-btn
        size="sm"
        class="float-right eyo-far-left"
        variant="primary"
        @click="doYes()"
      >
        {{ $$t('message.OK') }}
      </b-btn>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DocumentReadStringRecovered',
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
