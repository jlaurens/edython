<template>
  <b-btn id="toolbar-btn-copy-python" v-on:click="doIt()" :title="title" v-tippy :disabled="!canDoIt">
    <icon-base :width="32" :height="32" :icon-name="name"><icon-copy-python :theta="theta"/></icon-base>
  </b-btn>
</template>

<script>
  import IconBase from '@@/Icon/IconBase.vue'
  import IconCopyPython from '@@/Icon/IconCopyPython.vue'

  export default {
    name: 'copy-python',
    data: function () {
      return {
        theta: 1
      }
    },
    computed: {
      name () {
        return 'Copier en python'
      },
      title () {
        return 'Copier le code python dans le presse-papier'
      },
      canDoIt () {
        return !!this.$store.state.UI.selectedBlockId
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
        var block = this.$$.Blockly.selected
        if (block) {
          var p = new eYo.PythonExporter()
          var code = p.export(block, true)
          eYo.App.copyTextToClipboard(code)
          this.theta = 0
          this.$$.TweenLite.to(this, 0.5, {theta: 1})
        }
      }
    }
  }
</script>
