<template>
  <b-btn id="toolbar-btn-copy-python" v-on:click="doIt()" :title="title" v-tippy :disabled="!canDoIt">
    <icon-base :width="32" :height="32" :icon-name="name"><icon-copy-python :footstep="footstep"/></icon-base>
  </b-btn>
</template>

<script>
  import {mapGetters} from 'vuex'

  import IconBase from '@@/Icon/IconBase.vue'
  import IconCopyPython from '@@/Icon/IconCopyPython.vue'

  export default {
    name: 'copy-python',
    data: function () {
      return {
        footstep: 1
      }
    },
    computed: {
      ...mapGetters('Selected', [
        'eyo'
      ]),
      name () {
        return this.$$t('toolbar.name.copy_python')
      },
      title () {
        return this.$$t('toolbar.tooltip.copy_python')
      },
      canDoIt () {
        return !!this.eyo
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
      IconCopyPython
    },
    methods: {
      doIt () {
        var block = this.eyo && this.eyo.block_
        if (block) {
          var p = new eYo.PythonExporter()
          var code = p.export(block, {is_deep: true})
          eYo.App.copyTextToClipboard(code)
          this.footstep = 0
          eYo.$$.TweenLite.to(this, 0.5, {footstep: 1})
        }
      }
    }
  }
</script>
