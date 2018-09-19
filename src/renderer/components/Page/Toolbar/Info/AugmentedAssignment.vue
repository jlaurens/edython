<template>
  <b-button-toolbar id="info-augmented-assignment" key-nav  aria-label="Info toolbar augmented-assignment" justify>
    <b-button-toolbar>
      <b-button-group>
        <operator :eyo="eyo" :placeholder="placeholder"></operator>
      </b-button-group>
      <comment :eyo="eyo"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Operator from './AugmentedAssignment/Operator.vue'
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
      Comment,
      Common
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      placeholder: {
        type: Function,
        default: function (item) {
          return item
        }
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
