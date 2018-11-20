<template>
  <b-button-toolbar id="info-none" key-nav  aria-label="Info none" justify>
    {{info}}
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-none',
    computed: {
      info () {
        return 'Pas de bloc sélectionné'
      }
    }
  }
</script>
<style>
  #info-none {
    padding: 0 0.25rem;
  }
</style>
  