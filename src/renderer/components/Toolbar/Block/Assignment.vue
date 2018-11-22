<template>
  <b-btn-group id="block-assignment" key-nav  aria-label="Block group assignment" justify>
    <b-btn-group>
      <variant :eyo="eyo" :slotholder="slotholder"></variant>
    </b-btn-group>
    <comment :eyo="eyo"></comment>
  </b-btn-group>
</template>

<script>
  import Variant from './Assignment/Variant.vue'
  import Comment from './Comment.vue'

  export default {
    name: 'info-assignment',
    data: function () {
      return {
      }
    },
    components: {
      Variant,
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
  #block-assignment {
    padding: 0 0.25rem;
  }
</style>
