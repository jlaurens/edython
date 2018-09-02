<template>
  <b-button-toolbar id="info-assignment" key-nav  aria-label="Info toolbar assignment" justify>
    <b-button-toolbar>
      <variant :selected-block="selectedBlock" :placeholder="placeholder"></variant>
      <comment :selected-block="selectedBlock"></comment>
    </b-button-toolbar>
    <common :selected-block="selectedBlock"></common>
  </b-button-toolbar>
</template>

<script>
  import Variant from './Assignment/Variant.vue'
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-assignment',
    data: function () {
      return {
      }
    },
    components: {
      Variant,
      Comment,
      Common
    },
    props: {
      selectedBlock: {
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
  #info-assignment {
    padding: 0 0.25rem;
  }
</style>
