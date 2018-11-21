<template>
  <operator id="block-binary" key-nav  aria-label="Block toolbar binary" :eyo="eyo" :slotholder="slotholder"></operator>
</template>

<script>
  import Operator from './Binary/Operator.vue'

  export default {
    name: 'info-binary',
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
  #block-binary {
    padding: 0 0.25rem;
  }
</style>
