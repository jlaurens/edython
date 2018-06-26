<template>
  <b-btn :id="id" v-on:click="doIt()" :disabled="!canDoIt" :title="title" v-tippy>
    <icon-base :width="32" :height="32" :icon-name="name"><icon-copy-paste :copy="copy" :deep="deep" :step="step"/></icon-base>
  </b-btn>
</template>

<script>
  import IconBase from '@@/IconBase.vue'
  import IconCopyPaste from '@@/Icon/IconCopyPaste.vue'

  export default {
    name: 'copy-paste',
    data: function () {
      return {
        step: 1
      }
    },
    computed: {
      id () {
        return this.copy
          ? 'toolbar-btn-' + this.deep ? 'deep-copy' : '-copy'
          : 'toolbar-btn-paste'
      },
      title () {
        return this.copy
          ? this.deep ? 'Copier le bloc sélectionné' : 'Copier le bloc sélectionné et les suivants'
          : 'Coller le bloc du presse-papier'
      },
      name () {
        return this.copy
          ? this.deep ? 'Copier' : 'Copier avec les suivants'
          : 'Coller'
      },
      canDoIt () {
        return true
        // return this.copy
        //   ? !!this.$store.state.selected
        //   : !!Blockly.clipboardXml_
      }
    },
    props: {
      deep: {
        type: Boolean,
        default: false
      },
      copy: {
        type: Boolean,
        default: false
      }
    },
    components: {
      IconBase,
      IconCopyPaste
    },
    methods: {
      doIt () {
        if (this.copy) {
          if (eYo.App.doCopy(!this.deep)) {
            this.step = 0
            this.TweenLite.to(this, 0.5, {step: 1})
          }
        } else {
          Blockly.clipboardXml_ && eYo.App.workspace.paste(Blockly.clipboardXml_)
        }
      }
    }
  }
</script>
