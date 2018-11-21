<template>
  <b-button-group id="block-default" key-nav  aria-label="Block default" justify>
    <value :eyo="eyo"></value>
    <operator :eyo="eyo"></operator>
    <variant :eyo="eyo" :slotholder="slotholder"></variant>
    <comment :eyo="eyo"></comment>
    <span>type:&nbsp;{{eyo.block_.type}}</span>
  </b-button-group>
</template>

<script>
  import Operator from './Operator.vue'
  import Value from './Value.vue'
  import Variant from './Variant.vue'
  import Comment from './Comment.vue'

  export default {
    name: 'info-default',
    components: {
      Operator,
      Value,
      Variant,
      Comment
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    }
  }
</script>
<style>
  #block-default {
    padding: 0 0.25rem;
  }
</style>
  