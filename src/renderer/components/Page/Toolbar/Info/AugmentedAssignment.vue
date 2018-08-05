<template>
  <b-button-toolbar id="info-augmented-assignment" key-nav  aria-label="Info toolbar augmented-assignment" justify>
    <b-button-toolbar>
      <b-button-group>
        <operator :selected-block="selectedBlock"></operator>
        <variant :formatter="function (item) { return this.$t('message.'+item, {operator: this.selectedBlock.eyo.data.operator.get()})}" :selected-block="selectedBlock"></variant>
      </b-button-group>
      <comment :selected-block="selectedBlock"></comment>
    </b-button-toolbar>
    <common :selected-block="selectedBlock"></common>
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
      selectedBlock: {
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
