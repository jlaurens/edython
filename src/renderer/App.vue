<template>
  <b-container id="app" fluid>
    <router-view></router-view>
  </b-container>
</template>

<script>
export default {
  name: 'app',
  created () {
    // put this preload for main-window to give it prompt()
    const ipcRenderer = require('electron').ipcRenderer
    if (ipcRenderer) {
      window.prompt = function (text, defaultText) {
        return ipcRenderer.sendSync('prompt', {text: text, defaultText: defaultText})
      }
    }
  },
  mounted () {
    this.$nextTick(eYo.App.Document.doNew)
  }
}
</script>

<style lang="scss">
  body {
    margin: 0;
    padding: 0;
    height: 100vh;
  }
  #app .container {
    background-color:rgba(221, 221, 221, 0.8);
    max-width: 100%; /* override B */
  }
</style>
