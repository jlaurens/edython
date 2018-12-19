<template>
  <b-btn
    :id="id"
    v-on:click="doIt()"
    :disabled="!canDoIt"
    :title="title"
    v-tippy
    :variant="variant">
    <icon-base
      :width="width"
      :height="height"
      :icon-name="name"
      ><icon-copy-paste
        :copy="copy"
        :duplicate="duplicate"
        :deep="deep"
        :theta="theta"/></icon-base>
  </b-btn>
</template>

<script>
  import {mapState} from 'vuex'

  import IconBase from '@@/Icon/IconBase.vue'
  import IconCopyPaste from '@@/Icon/IconCopyPaste.vue'

  export default {
    name: 'copy-paste',
    data: function () {
      return {
        theta: 1
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
            ? this.$$t(`toolbar.tooltip.copy_block_deep`)
            : this.$$t(`toolbar.tooltip.copy_block_shallow`)
          : this.duplicate
            ? this.deep
              ? this.$$t(`toolbar.tooltip.duplicate_block_deep`)
              : this.$$t(`toolbar.tooltip.duplicate_block_shallow`)
            : this.$$t(`toolbar.tooltip.paste_block`)
      },
      name () {
        return this.copy
          ? this.deep
            ? this.$$t(`toolbar.content.copy_block_deep`)
            : this.$$t(`toolbar.content.copy_block_shallow`)
          : this.duplicate
            ? this.deep
              ? this.$$t(`toolbar.content.duplicate_block_deep`)
              : this.$$t(`toolbar.content.duplicate_block_shallow`)
            : this.$$t(`toolbar.content.paste_block`)
      },
      canDoIt () {
        return this.copy || this.duplicate
          ? !!this.selectedBlockId
          : !!this.blockClipboard
      },
      ...mapState('UI', [
        'selectedBlockId',
        'blockClipboard'
      ])
    },
    methods: {
      doIt () {
        if (this.copy) {
          if (eYo.App.doCopy(!this.deep)) {
            this.theta = 0
            eYo.$$.TweenLite.to(this, 0.5, {theta: 1})
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
