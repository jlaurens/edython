<template>
  <div class="info">
    {{info}}
  </div>
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
  