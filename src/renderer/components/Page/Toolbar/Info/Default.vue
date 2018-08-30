<template>
  <b-button-toolbar id="info-default" key-nav  aria-label="Info toolbar default" justify>
    <b-button-toolbar>
      d<span>{{selectedBlock.type}}</span>
      <value :selected-block="selectedBlock"></value>
      <operator :selected-block="selectedBlock"></operator>
      <variant :selected-block="selectedBlock"></variant>
      <comment :selected-block="selectedBlock"></comment>
    </b-button-toolbar>
    <common :selected-block="selectedBlock"></common>
  </b-button-toolbar>
</template>

<script>
  import Operator from './Operator.vue'
  import Value from './Value.vue'
  import Variant from './Variant.vue'
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-default',
    components: {
      Operator,
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
  #info-default {
    padding: 0 0.25rem;
  }
</style>
  