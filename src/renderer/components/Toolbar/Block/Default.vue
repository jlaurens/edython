<template>
  <b-btn-group id="block-default" key-nav  aria-label="Block default" justify>
    <value></value>
    <operator></operator>
    <variant
      :slotholder="slotholder"
      >
    </variant>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'
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
  
