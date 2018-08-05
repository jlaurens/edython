<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-group class="mx-1">
      <comment :selected-block="selectedBlock"></comment>
    </b-button-group>
    <common :selected-block="selectedBlock"></common>
  </b-button-toolbar>
</template>

<script>
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
      }
    },
    components: {
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
</style>
