<template>
  <b-btn
    id="toolbar-btn-run-python"
    v-on:click="doIt()"
    :title="title"
    v-tippy
    :disabled="!canDoIt">
    <icon-base
      :width="32"
      :height="32"
      :icon-name="name"
    >
      <icon-run
        :running="running1"
        :active="canDoIt"
      ></icon-run>
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
        step: 1
      }
    },
    computed: {
      ...mapState('Py', {
        'running1': state => {
          console.log('state.running1', state.running1)
          return state.running1
        }
      }),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      locale () {
        return this.$i18n.locale
      },
      name () {
        return this.$$t('toolbar.content.run_python', this.locale)
      },
      title () {
        return this.$$t('toolbar.tooltip.run_python', this.locale)
      },
      canDoIt () {
        return !!this.rootControl
      },
      rootControl () {
        return this.eyo && this.eyo.rootControl
      }
    },
    components: {
      IconBase,
      IconRun
    },
    watch: {
      running1 (newValue, oldValue) {
        if (newValue) {
          var root = this.rootControl
          if (root) {
            this.$nextTick(() => {
              root.runScript()
            })
          }
        }
      }
    },
    methods: {
      doIt () {
        var root = this.rootControl
        if (root) {
          this.$$.bus.$emit('will-run-script')
          // this.$nextTick(() => {
          //   root.runScript()
          // })
        }
      }
    }
  }
</script>
