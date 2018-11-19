<template>
  <b-button-toolbar id="info-assignment" key-nav  aria-label="Info toolbar assignment" justify>
    <variant :eyo="eyo" :slotholder="slotholder"></variant>
    <comment :eyo="eyo"></comment>
  </b-button-toolbar>
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
  #info-assignment {
    padding: 0 0.25rem;
  }
</style>
