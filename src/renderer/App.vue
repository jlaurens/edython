<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'edython'
  }
</script>

<style>
  body {
    margin: 0;
    padding: 0;
    background: #f4f4f4;
    height: 100vh;
  }

  #app {
    height: 100%;
  }
</style>