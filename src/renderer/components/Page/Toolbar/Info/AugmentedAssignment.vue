<template>
  <b-button-toolbar id="info-augmented-assignment" key-nav  aria-label="Info toolbar augmented-assignment" justify>
    <b-button-toolbar>
      <b-button-group>
        <operator :eyo="eyo"></operator>
        <variant :formatter="function (item) { return this.$t('message.'+item, {operator: this.eyo.operator_p})}" :eyo="eyo"></variant>
      </b-button-group>
      <comment :eyo="eyo"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Operator from './Operator.vue'
  import Variant from './Variant.vue'
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-augmented-assignment',
    data: function () {
      return {
      }
    },
    components: {
      Operator,
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
  #info-augmented-assignment {
    padding: 0 0.25rem;
  }
  #info-augmented-assignment .btn {
    padding: 0 0.25rem;
  }
</style>
