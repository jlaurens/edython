<template>
  <b-btn-toolbar
    id="main-toolbar"
    ref="toolbar"
    key-nav
    aria-label="Main toolbar"
    justify
  >
    <b-btn-group>
      <b-btn
        id="toolbar-site"
        v-tippy
        title="Aller au site Edython"
        @click=" doSite('https://edython.eu')"
      >
        <img
          src="static/icon_light.svg"
          height="32"
          alt="Edython"
        >
      </b-btn>
      <b-btn
        id="main-toolbar-debug"
        v-tippy
        title="Demander une correction, une amélioration"
        @click="doSite('https://github.com/jlaurens/edython/issues')"
      >
        <icon-base
          icon-name="bug"
        >
          <icon-bug />
        </icon-base>
      </b-btn>
      <main-demo />
      <main-mode />
    </b-btn-group>
    <main-storage />
    <b-btn-group>
      <run-python />
    </b-btn-group>
    <copy-paste />
    <brick-layout />    
    <b-btn-group>
      <main-undo-redo
        :redo="false"
      />
      <main-undo-redo
        :redo="true"
      />
    </b-btn-group>
    <main-menu
      ref="menu"
    />
  </b-btn-toolbar>
</template>

<script>
import {mapMutations} from 'vuex'

import MainMenu from './Main/Menu.vue'
import MainUndoRedo from './Main/UndoRedo.vue'
import MainDemo from './Main/Demo.vue'
import RunPython from './Main/RunPython.vue'
import CopyPaste from './Main/CopyPaste.vue'
import BrickLayout from './Main/BrickLayout.vue'
import MainStorage from './Main/Storage.vue'
import MainMode from './Main/Mode.vue'
  
import IconBase from '@@/Icon/IconBase.vue'
import IconBug from '@@/Icon/IconBug.vue'
import IconTogglePanels from '@@/Icon/IconTogglePanels.vue'

var ResizeSensor = require('css-element-queries/src/ResizeSensor')

export default {
  name: 'MainToolbar',
  components: {
    IconBase,
    IconBug,
        IconTogglePanels, // eslint-disable-line 
    MainMenu,
    MainUndoRedo,
    MainDemo,
    RunPython,
    CopyPaste,
    BrickLayout,
    MainStorage,
    MainMode
  },
  data () {
    return {
      selected: eYo.$$.eYo.App.CONSOLE,
      titles: {
        console: eYo.$$.eYo.App.CONSOLE,
        turtle: eYo.$$.eYo.App.Turtle
      },
      resizeSensor: undefined
    }
  },
  mounted () {
    if (!this.resizeSensor) {
      this.resizeSensor = new ResizeSensor(
        this.$refs.toolbar.$el,
        this.$$didResize.bind(this)
      )
    }
    this.$$.bus.$on('toolbar-resize',
      this.$$didResize.bind(this)
    )
    this.$$didResize()
  },
  methods: {
    ...mapMutations('Page', [
      'setToolbarMainHeight'
    ]),
    $$didResize () {
      this.setToolbarMainHeight(
        this.$refs.menu.$el.offsetTop +
          this.$refs.menu.$el.clientHeight
      )
    },
    doSite (url) {
      if (this.$electron && this.$electron.shell) {
        // we *are in electron
        this.$electron.shell.openExternal(url)
      } else {
        var win = window.open(url, '_blank')
        win.focus()
      }
    }
  }
}
</script>
<style>
  #main-toolbar {
    text-align: center;
    height: 3rem;
    padding: 0;
    min-width: 300px!important;
  }
  #main-toolbar .btn {
    height: 2.5rem;
    vertical-align: middle;
    padding: 0.25rem 0.5rem;
  }

  #main-toolbar .btn-group {
    margin: 0 0.25rem;
    margin-top: 0.25rem;
  }
  /*The size sensor adds a hidden div after the last child*/

  #main-toolbar .btn-group .btn-group {
    margin: 0;
  }
  #main-toolbar .btn.eyo-display-packed:not(:last-child) {
    padding-right:0;
  }
  #main-toolbar .btn.eyo-display-packed:last-child {
    padding-left:0;
  }
</style>
