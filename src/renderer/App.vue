<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'edython',
    mounted () {
      // put this preload for main-window to give it prompt()
      const ipcRenderer = require('electron').ipcRenderer
      window.prompt = function (text, defaultText) {
        return ipcRenderer.sendSync('prompt', {text: text, defaultText: defaultText})
      }
      var self = this
      eYo.App.didClearUndo = function () {
        // console.log('didClearUndo')
        self.$store.commit('UI_SET_UNDO_COUNT', 0)
        self.$store.commit('UI_SET_REDO_COUNT', 0)
        if (self.$store.state.UI.undoStage > 0) {
          // the last saved state won't ever be reached
          self.$store.commit('UI_SET_UNDO_STAGE', -1)
        }
      }
      eYo.App.didProcessUndo = function () {
        // console.log('didProcessUndo')
        self.$store.commit('UI_SET_UNDO_COUNT', eYo.App.workspace.undoStack_.length)
        self.$store.commit('UI_SET_REDO_COUNT', eYo.App.workspace.redoStack_.length)
      }
      eYo.App.didUnshiftUndo = function () {
        self.$store.commit('UI_SET_UNDO_STAGE', self.$store.state.UI.undoStage - 1) // negative values make sense
      }
      eYo.App.didPushUndo = function () {
        // console.log('didPushUndo')
        var count = eYo.App.workspace.undoStack_.length
        self.$store.commit('UI_SET_UNDO_COUNT', count)
        if (self.$store.state.UI.undoStage >= count) {
          // the last saved state won't ever be reached
          self.$store.commit('UI_SET_UNDO_STAGE', -1)
        }
      }
      eYo.App.didTouchBlock = function (block) {
        // self.$store.commit('UI_SET_SELECTED', block) breaks everything when uncommented
      }
    }
    // mounted: function () {
    //   this.handleResize = function (e) {
    //     console.log('handleResize', window.innerWidth)
    //   }
    //   window.addEventListener('resize', this.handleResize)
    // },
    // beforeDestroy: function () {
    //   window.removeEventListener('resize', this.handleResize)
    // }
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
