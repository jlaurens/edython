<template>
  <b-modal
    id="dialog-should-save"
    ref="dialog"
    lazy
    :title="$$t(&quot;panel.should_save.title&quot;)"
    @hidden="doHidden"
    @keyup.esc.native="doEsc"
  >
    <div
      class="d-block"
    >
      {{ $$t("panel.should_save.content") }}
    </div>
    <div
      slot="modal-footer"
      class="w-100"
    >
      <b-btn
        size="sm"
        class="float-right eyo-far-left"
        variant="primary"
        @click="doYes"
      >
        {{ $$t('message.YES') }}
      </b-btn>
      <b-btn
        size="sm"
        class="float-right"
        variant="secondary"
        @click="doNo"
      >
        {{ $$t('message.NO') }}
      </b-btn>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DocumentShouldSave',
  methods: {
    show (callback) { // callback: () -> ()
      this.$refs.dialog.show()
      this.callback = callback
    },
    doYes (evt) {
      this.$refs.dialog.hide()
      this.$root.$emit('document-save', evt, this.callback) // callback needed when just hidden
    },
    doNo (evt) { //eslint-disable-line no-unused-vars
      this.$refs.dialog.hide()
      this.$root.$emit('document-save-abort')
      this.callback && this.callback()
    },
    doEsc (evt) { //eslint-disable-line no-unused-vars
      this.$refs.dialog.hide()
      this.$root.$emit('document-save-abort')
      this.callback && this.callback()
    },
    doHidden (evt) { //eslint-disable-line no-unused-vars
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
