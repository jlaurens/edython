<template>
  <b-btn-group
    id="brick-default"
    key-nav
    aria-label="Brick default"
    justify
  >
    <value />
    <operator />
    <variant
      :slotholder="slotholder"
    />
  </b-btn-group>
</template>

<script>
import Operator from './Operator.vue'
import Value from './Value.vue'
import Variant from './Variant.vue'

export default {
    name: 'InfoDefault',
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
  
