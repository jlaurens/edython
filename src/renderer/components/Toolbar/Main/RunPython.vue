<template>
  <b-btn
    id="toolbar-btn-run-python"
    v-on:click="doIt()"
    :title="$$t('toolbar.tooltip.run_python')"
    v-tippy
    :disabled="!canDoIt">
    <icon-base
      :width="32"
      :height="32"
      :icon-name="$$t('toolbar.content.run_python')"
      :icon-color="color"
    >
      <icon-run></icon-run>
    </icon-base>
  </b-btn>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  import IconBase from '@@/Icon/IconBase.vue'
  import IconRun from '@@/Icon/IconRun.vue'

  export default {
    name: 'run-python',
    data: function () {
      return {
        saved_step: undefined
      }
    },
    components: {
      IconBase,
      IconRun
    },
    computed: {
      ...mapState('Py', [
        'running1'
      ]),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      canDoIt () {
        return !!this.rootControl && !this.rootControl.someTargetIsMissing
      },
      rootControl () {
        this.$$synchronize(this.step)
        return this.eyo && this.eyo.rootControl
      },
      color () {
        return this.running1
          ? '#f9951b'
          : this.canDoIt
            ? '#8dee3f'
            : 'white'
      }
    },
    mounted () {
      // listen on (dis)connection to update the color of the icon
      var back = () => {
        --this.saved_step
      }
      this.$$.bus.$on('did-connect', back)
      this.$$.bus.$on('did-disconnect', back)
    },
    methods: {
      doIt () {
        var root = this.rootControl
        if (root) {
          this.$root.$emit('will-run-script', root)
        }
      }
    }
  }
</script>
