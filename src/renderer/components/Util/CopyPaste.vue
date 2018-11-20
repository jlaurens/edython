<template>
  <b-btn :id="id" v-on:click="doIt()" :disabled="!canDoIt" :title="title" v-tippy :variant="variant">
    <icon-base :width="width" :height="height" :icon-name="name"><icon-copy-paste :copy="copy" :duplicate="duplicate" :deep="deep" :step="step"/></icon-base>
  </b-btn>
</template>

<script>
  import IconBase from '@@/Icon/IconBase.vue'
  import IconCopyPaste from '@@/Icon/IconCopyPaste.vue'

  export default {
    name: 'copy-paste',
    data: function () {
      return {
        step: 1
      }
    },
    props: {
      width: {
        type: Number,
        default: 32
      },
      height: {
        type: Number,
        default: 32
      },
      deep: {
        type: Boolean,
        default: false
      },
      copy: {
        type: Boolean,
        default: false
      },
      duplicate: {
        type: Boolean,
        default: false
      },
      variant: {
        type: String,
        default: 'secondary'
      }
    },
    components: {
      IconBase,
      IconCopyPaste
    },
    computed: {
      id () {
        return 'toolbar-btn-' + (this.copy
          ? this.deep
            ? 'deep-copy'
            : 'copy'
          : this.duplicate
            ? this.deep
              ? 'deep-duplicate'
              : 'duplicate'
            : 'paste'
        )
      },
      title () {
        return this.copy
          ? this.deep
            ? 'Copier le bloc sélectionné et les suivants'
            : 'Copier le bloc sélectionné'
          : this.duplicate
            ? this.deep
              ? 'Dupliquer le bloc sélectionné et les suivants'
              : 'Dupliquer le bloc sélectionné'
            : 'Coller le block du presse-papier'
      },
      name () {
        return this.copy
          ? this.deep
            ? 'Copier avec les suivants'
            : 'Copier'
          : this.duplicate
            ? this.deep
              ? 'Dupliquer avec les suivants'
              : 'Dupliquer'
            : 'Coller'
      },
      canDoIt () {
        return this.copy || this.duplicate
          ? !!this.$store.state.UI.selectedBlockId
          : !!this.$store.state.UI.blockClipboard
      }
    },
    methods: {
      doIt () {
        if (this.copy) {
          if (eYo.App.doCopy(!this.deep)) {
            this.step = 0
            this.$$.TweenLite.to(this, 0.5, {step: 1})
          }
        } else if (this.duplicate) {
          Blockly.duplicate_(Blockly.selected)
        } else {
          Blockly.clipboardXml_ && eYo.App.workspace.paste(Blockly.clipboardXml_)
        }
      }
    }
  }
</script>
