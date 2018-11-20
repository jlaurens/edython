<template>
  <b-button-group>
    <b-btn :id="id" v-on:click="doIt()" :disabled="!canDoIt" :title="titleClap" v-tippy>
      <icon-base :width="32" :height="32" :icon-name="name"><icon-clap/></icon-base>
    </b-btn>
    <b-btn :id="id" v-on:click="doIt()" :disabled="!canDoIt" :title="titleGear" v-tippy>
      <icon-base :width="32" :height="32" :icon-name="name"><icon-gear/></icon-base>
    </b-btn>
  </b-button-group>
</template>

<script>
  import IconBase from '@@/Icon/IconBase.vue'
  import IconClap from '@@/Icon/IconClap.vue'
  import IconGear from '@@/Icon/IconGear.vue'

  export default {
    name: 'edit',
    data: function () {
      return {
        step: 1
      }
    },
    components: {
      IconBase,
      IconClap,
      IconGear
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
