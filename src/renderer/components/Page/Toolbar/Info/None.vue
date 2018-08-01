<template>
  <div id="info-none">
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
  #info-none {
    font-style: italic;
    text-align: left;
    color: #666;
    width: 100%;
    padding: 0 0.25rem;
  }
</style>