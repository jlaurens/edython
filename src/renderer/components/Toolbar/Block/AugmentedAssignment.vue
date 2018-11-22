<template>
  <b-btn-toolbar id="block-augmented-assignment" key-nav  aria-label="Block toolbar augmented-assignment" justify>
    <operator :eyo="eyo" :slotholder="slotholder"></operator>
    <comment :eyo="eyo"></comment>
  </b-btn-toolbar>
</template>

<script>
  import Operator from './AugmentedAssignment/Operator.vue'
  import Comment from './Comment.vue'

  export default {
    name: 'info-augmented-assignment',
    data: function () {
      return {
      }
    },
    components: {
      Operator,
      Comment
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
  #block-augmented-assignment {
    padding: 0 0.25rem;
  }
  #block-augmented-assignment .btn {
    padding: 0 0.25rem;
  }
</style>
