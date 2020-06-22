<template>
  <b-btn-group>
    <b-btn
      :id="id"
      v-tippy
      :disabled="!canDoIt"
      :title="titleClap"
      @click="doIt()"
    >
      <icon-base
        :width="32"
        :height="32"
        :icon-name="name"
      >
        <icon-clap />
      </icon-base>
    </b-btn>
    <b-btn
      :id="id"
      v-tippy
      :disabled="!canDoIt"
      :title="titleGear"
      @click="doIt()"
    >
      <icon-base
        :width="32"
        :height="32"
        :icon-name="name"
      >
        <icon-gear />
      </icon-base>
    </b-btn>
  </b-btn-group>
</template>

<script>
import IconBase from '@@/Icon/IconBase.vue'
import IconClap from '@@/Icon/IconClap.vue'
import IconGear from '@@/Icon/IconGear.vue'

export default {
  name: 'Edit',
  components: {
    IconBase,
    IconClap,
    IconGear
  },
  data: function () {
    return {
      step: 1
    }
  },
  computed: {
    canDoIt () {
      return true
      // return this.copy
      //   ? !!this.$store.state.selected
      //   : !!Blockly.clipboardXml_
    }
  },
  methods: {
    doIt () {
      console.log('Did it!')
    }
  }
}
</script>
