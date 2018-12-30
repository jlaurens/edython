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
      <icon-run/>
    </icon-base>
  </b-btn>
</template>

<script>
  import {mapGetters} from 'vuex'

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
      name () {
        return 'Exécuter'
      },
      title () {
        return 'Exécuter dans la console le code python du groupe qui contient le bloc sélectionné'
      },
      canDoIt () {
        return !!this.rootControl
      },
      ...mapGetters('Selected', [
        'eyo'
      ]),
      rootControl () {
        return this.eyo && this.eyo.rootControl
      }
    },
    components: {
      IconBase,
      IconRun
    },
    methods: {
      doIt () {
        var root = this.rootControl
        if (root) {
          this.$$.bus.$emit('will-run-script')
          root.runScript()
        }
      }
    }
  }
</script>
