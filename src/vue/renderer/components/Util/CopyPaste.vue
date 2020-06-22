<template>
  <b-btn
    :id="id"
    v-tippy
    :disabled="!canDoIt"
    :title="title"
    :variant="variant"
    @click="doIt()"
  >
    <icon-base
      :width="width"
      :height="height"
      :icon-name="name"
    >
      <icon-copy-paste
        :copy="copy"
        :duplicate="duplicate"
        :deep="deep"
        :theta="theta"
      />
    </icon-base>
  </b-btn>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

import IconBase from '@@/Icon/IconBase.vue'
import IconCopyPaste from '@@/Icon/IconCopyPaste.vue'

export default {
  name: 'CopyPaste',
  components: {
    IconBase,
    IconCopyPaste
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
  data: function () {
    return {
      theta: 1
    }
  },
  computed: {
    ...mapGetters('Selected', [
      'eyo'
    ]),
    ...mapState('UI', [
      'brickClipboard'
    ]),
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
    canDoIt () {
      return this.copy || this.duplicate
        ? !!this.eyo
        : !!this.brickClipboard
    },
    locale () {
      return this.$i18n.locale
    },
    name () {
      var deep_or_shallow = this.deep ? 'deep' : 'shallow'
      return this.copy
        ? this.$$t(`toolbar.content.copy_brick_${deep_or_shallow}`)
        : this.duplicate
          ? this.$$t(`toolbar.content.duplicate_brick_${deep_or_shallow}`)
          : this.$$t(`toolbar.content.paste_brick`)
    },
    title () {
      var deep_or_shallow = this.deep ? 'deep' : 'shallow'
      return this.copy
        ? this.$$t(`toolbar.tooltip.copy_brick_${deep_or_shallow}`, this.locale)
        : this.duplicate
          ? this.$$t(`toolbar.tooltip.duplicate_brick_${deep_or_shallow}`)
          : this.$$t(`toolbar.tooltip.paste_brick`)
    }
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
