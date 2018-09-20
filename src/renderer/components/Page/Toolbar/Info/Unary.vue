<template>
  <b-button-toolbar id="info-unary" key-nav  aria-label="Info toolbar unary" justify>
    <b-button-toolbar>
      <operator :eyo="eyo" :slotholder="slotholder"></operator>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Operator from './Unary/Operator.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-unary',
    data: function () {
      return {
      }
    },
    components: {
      Operator,
      Common
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
  #info-unary {
    padding: 0 0.25rem;
  }
</style>
