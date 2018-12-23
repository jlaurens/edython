<template>
  <b-btn-toolbar
    id="main-toolbar"
    key-nav
    aria-label="Main toolbar"
    justify>
    <b-btn-group>
      <b-btn
        id="toolbar-site"
        v-on:click=" doSite('https://edython.eu')"
        title="Aller au site Edython"
        v-tippy>
        <img
          src="static/icon_light.svg"
          height="32"
          alt="Edython"/>
      </b-btn>
      <b-btn
        id="main-toolbar-debug"
        v-on:click="doSite('https://github.com/jlaurens/edython/issues')"
        title="Demander une correction, une amélioration"
        v-tippy>
        <icon-base
          icon-name="bug"><icon-bug /></icon-base>
      </b-btn>
      <main-demo/>
      <main-mode />
    </b-btn-group>
    <main-storage />
    <b-btn-group>
      <run-python />
      <copy-python />
    </b-btn-group>
    <copy-paste />
    <block-layout />    
    <b-btn-group>
      <main-undo-redo
        :redo="false" />
      <main-undo-redo
        :redo="true" />
    </b-btn-group>
    <main-menu />
  </b-btn-toolbar>
</template>

<script>
  import MainMenu from './Main/Menu.vue'
  import MainUndoRedo from './Main/UndoRedo.vue'
  import MainDemo from './Main/Demo.vue'
  import RunPython from './Main/RunPython.vue'
  import CopyPaste from './Main/CopyPaste.vue'
  import BlockLayout from './Main/BlockLayout.vue'
  import CopyPython from './Main/CopyPython.vue'
  import MainStorage from './Main/Storage.vue'
  import MainMode from './Main/Mode.vue'
  
  import IconBase from '@@/Icon/IconBase.vue'
  import IconBug from '@@/Icon/IconBug.vue'
  import IconTogglePanels from '@@/Icon/IconTogglePanels.vue'

  export default {
    name: 'main-toolbar',
    data: function () {
      return {
        selected: eYo.$$.eYo.App.CONSOLE,
        titles: {
          console: eYo.$$.eYo.App.CONSOLE,
          turtle: eYo.$$.eYo.App.Turtle
        }
      }
    },
    components: {
      IconBase,
      IconBug,
      IconTogglePanels,
      MainMenu,
      MainUndoRedo,
      MainDemo,
      RunPython,
      CopyPaste,
      BlockLayout,
      CopyPython,
      MainStorage,
      MainMode
    },
    mounted () {
      // offsetHeight
      // jQuery(window).on('resize', _.debounce(calculateLayout, 150));
      // window.addEventListener('resize', (event) => {
      //   console.log('RESIZER', this.$el.offsetHeight, this.$store)
      // })
    },
    methods: {
      doSite (url) {
        if (eYo.$$.electron && eYo.$$.electron.shell) {
          // we *are i electron
          eYo.$$.electron.shell.openExternal(url)
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
    padding: 0.25rem 0;
    min-width: 300px!important;
  }
  #main-toolbar .btn {
    height: 2.5rem;
    vertical-align: middle;
    padding: 0.25rem 0.5rem;
  }

  #main-toolbar .btn-group {
    margin: 0 0.25rem;
  }
  #main-toolbar .btn-group:first-child {
    margin-left: 0;
  }
  #main-toolbar .btn-group:last-child {
    margin-right: 0;
  }
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
