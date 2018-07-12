<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'edython',
    created () {
      // put this preload for main-window to give it prompt()
      var self = this
      var ipcRenderer = require('electron').ipcRenderer
      ipcRenderer.on('new', self.$$.eYo.App.Document.doNew)
      ipcRenderer.on('open', self.$$.eYo.App.Document.doOpen)
      ipcRenderer.on('save', self.$$.eYo.App.Document.doSave)
      ipcRenderer.on('saveas', self.$$.eYo.App.Document.doSaveAs)
      // const ipcRenderer = require('electron').ipcRenderer
      window.prompt = function (text, defaultText) {
        return ipcRenderer.sendSync('prompt', {text: text, defaultText: defaultText})
      }
    }
  }
</script>

<style lang="scss">
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
