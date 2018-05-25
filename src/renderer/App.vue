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
    height: 100vh;
  }
  #app {
    height: 100%;
    background-color:rgba(221, 221, 221, 0.8);
  }
</style>
