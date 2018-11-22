<template>
  <operator id="block-unary" key-nav  aria-label="Block toolbar unary" :eyo="eyo" :step="step" :slotholder="slotholder"></operator>
</template>

<script>
  import Operator from './Unary/Operator.vue'

  export default {
    name: 'info-unary',
    data: function () {
      return {
      }
    },
    components: {
      Operator
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
  #block-unary {
    padding: 0 0.25rem;
  }
</style>
