<template>
  <b-button-toolbar id="info-default" key-nav  aria-label="Info toolbar default" justify>
    <common :locked="true"></common>
  </b-button-toolbar>
</template>

<script>
  import Common from './Common.vue'

  export default {
    name: 'info-default',
    components: {
      Common
    }
  }
</script>
