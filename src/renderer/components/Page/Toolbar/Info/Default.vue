<template>
  <b-button-toolbar id="info-default" key-nav  aria-label="Info toolbar default" justify>
    <b-button-toolbar>
      d<span>{{selectedBlock.type}}</span>
      <value :eyo="eyo"></value>
      <operator :eyo="eyo"></operator>
      <variant :eyo="eyo"></variant>
      <comment :eyo="eyo"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
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
      eyo: {
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
  