<template>
  <b-btn-group id="block-default" key-nav  aria-label="Block default" justify>
    <value
      :eyo="eyo"
      :step="step"
      >
    </value>
    <operator
      :eyo="eyo"
      :step="step"
      >
    </operator>
    <variant
      :eyo="eyo"
      :step="step"
      :slotholder="slotholder"
      >
    </variant>
  </b-btn-group>
</template>

<script>
  import Operator from './Operator.vue'
  import Value from './Value.vue'
  import Variant from './Variant.vue'

  export default {
    name: 'info-default',
    components: {
      Operator,
      Value,
      Variant
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      step: {
        type: Number,
        default: 0
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
</style>
  
