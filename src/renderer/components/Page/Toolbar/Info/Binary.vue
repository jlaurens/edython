<template>
  <b-button-toolbar id="info-binary" key-nav  aria-label="Info toolbar binary" justify>
    <b-button-toolbar>
      <operator :eyo="eyo" :slotholder="slotholder"></operator>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Operator from './Binary/Operator.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-binary',
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
  #info-binary {
    padding: 0 0.25rem;
  }
</style>
