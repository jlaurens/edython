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
      if (!process.env.IS_WEB) {
        var ipcRenderer = this.$$.electron.ipcRenderer
        // we *are* in electron
        ipcRenderer.on('new', this.$$.eYo.App.Document.doNew)
        ipcRenderer.on('open', this.$$.eYo.App.Document.doOpen)
        ipcRenderer.on('save', this.$$.eYo.App.Document.doSave)
        ipcRenderer.on('saveas', this.$$.eYo.App.Document.doSaveAs)
        // const ipcRenderer = require('electron').ipcRenderer
        window.prompt = function (text, defaultText) {
          return ipcRenderer.sendSync('prompt', {text: text, defaultText: defaultText})
        }
      }
    },
    mounted () {
      this.$nextTick(this.$$.eYo.App.Document.doNew)
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
