<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-group class="mx-1">
      <modifier :selected-block="selectedBlock"></modifier>
      <value :selected-block="selectedBlock" :dataKey="'dotted'"></value>
      <value :selected-block="selectedBlock" :dataKey="'annotation'"></value>
      <value :selected-block="selectedBlock" :dataKey="'definition'"></value>
    </b-button-group>
    <b-button-group class="mx-1">
      q
      <variant :selected-block="selectedBlock"></variant>
    </b-button-group>
    <common :selected-block="selectedBlock"></common>
  </b-button-toolbar>
</template>

<script>
  import Modifier from './Modifier.vue'
  import Value from './Value.vue'
  import Variant from './Variant.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
      }
    },
    components: {
      Modifier,
      Value,
      Variant,
      Comment,
      Common
    },
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    }
  }
</script>
<style>
</style>
