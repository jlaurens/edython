<template>
  <b-container
    id="app"
    fluid
    class="app"
  >
    <router-view />
  </b-container>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'App',
  data () {
    return {
      copyBrick: 0
    }
  },
  computed: {
    ...mapState('Pref', [
      'deepCopy'
    ])
  },
  watch: {
    deepCopy (newValue, oldValue) { //eslint-disable-line no-unused-vars
      eYo.copyBrick = this.getCopyBrick(newValue)
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
  mounted () {
    this.copyBrick = eYo.copyBrick
    eYo.copyBrick = this.getCopyBrick(this.deepCopy)
  },
  methods: {
    getCopyBrick (value) {
      var copyBrick = this.copyBrick
      return function (brick, deep) {
        return copyBrick.call(this, brick, !value === !!deep)
      }
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
