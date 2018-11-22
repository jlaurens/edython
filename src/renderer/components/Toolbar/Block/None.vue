<template>
  <b-btn-toolbar id="block-none" key-nav  aria-label="Block none" justify>
    {{info}}
  </b-btn-toolbar>
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
  #block-none {
    padding: 0 0.25rem;
  }
</style>
  