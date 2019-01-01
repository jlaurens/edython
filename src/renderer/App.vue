<template>
  <b-container
    id="app"
    fluid
    class="app">
    <router-view></router-view>
  </b-container>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'app',
  data: function () {
    return {
      copyBlock: 0
    }
  },
  created () {
    // put this preload for main-window to give it prompt()
    const ipcRenderer = require('electron').ipcRenderer
    if (ipcRenderer) {
      window.prompt = (text, defaultText) => {
        return ipcRenderer.sendSync('prompt', {
          text: text,
          defaultText: defaultText
        })
      }
    }
  },
  computed: {
    ...mapState('Pref', [
      'deepCopy'
    ])
  },
  mounted () {
    this.copyBlock = eYo.copyBlock
    eYo.copyBlock = this.getCopyBlock(this.deepCopy)
  },
  methods: {
    getCopyBlock (value) {
      var copyBlock = this.copyBlock
      return function (block, deep) {
        return copyBlock.call(this, block, !value === !!deep)
      }
    }
  },
  watch: {
    deepCopy (newValue, oldValue) {
      eYo.copyBlock = this.getCopyBlock(newValue)
    }
  }
}
</script>

<style lang="scss">
  body {
    margin: 0;
    padding: 0;
    height: 100vh;
    min-width: 300px!important;
  }
  .app {
    background-color:rgba(221, 221, 221, 0.8);
    padding: 0;
    height: 100%;
  }
  .app .container {
    max-width: 100%; /* override B */
  }
</style>
