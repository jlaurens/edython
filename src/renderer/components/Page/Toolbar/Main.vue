<template>
  <b-button-toolbar id="toolbar-main" key-nav  aria-label="Main toolbar" justify>
    <b-button-group class="mx-1">
      <b-btn id="toolbar-site" v-on:click=" doSite('http://edython.eu')" title="Aller au site Edython" v-tippy>
        <img src="static/icon_light.svg" height="32" alt="Edython"/>
      </b-btn>
      <b-btn id="toolbar-debug" v-on:click="doSite('https://github.com/jlaurens/edython/issues')" title="Demander une correction, une amélioration" v-tippy>
        <icon-base icon-name="bug"><icon-bug /></icon-base>
      </b-btn>
      <main-demo/>
    </b-button-group>
    <main-storage />
    <b-button-group class="mx-1">
      <run-python />
      <copy-python />
    </b-button-group>
    <copy-paste />
    <b-button-group class="mx-1">
      <main-undo-redo :redo="false" />
      <main-undo-redo :redo="true" />
    </b-button-group>
    <main-display />
    <main-mode />
    <!--b-button-group class="mx-1">
      <b-btn id="toolbar-toggle-panels" v-on:click="doTogglePanelsVisible()" :title="toolbarTogglePanelsTitle" v-tippy>
        <icon-base :width="32" :height="32" icon-name="toggle"><icon-toggle-panels :variant="showTogglePanel" /></icon-base>
      </b-btn>
    </b-button-group-->
    <main-menu />
  </b-button-toolbar>
</template>

<script>
  import MainMenu from './Main/Menu.vue'
  import MainUndoRedo from './Main/UndoRedo.vue'
  import MainDemo from './Main/Demo.vue'
  import RunPython from './Main/RunPython.vue'
  import CopyPaste from './Main/CopyPaste.vue'
  import CopyPython from './Main/CopyPython.vue'
  import MainStorage from './Main/Storage.vue'
  import MainDisplay from './Main/Display.vue'
  import MainMode from './Main/Mode.vue'
  
  import IconBase from '@@/IconBase.vue'
  import IconBug from '@@/Icon/IconBug.vue'
  import IconTogglePanels from '@@/Icon/IconTogglePanels.vue'

  export default {
    name: 'page-toolbar',
    data: function () {
      return {
        selected: 'console',
        titles: {
          console: 'Console',
          turtle: 'Tortue'
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
      CopyPython,
      MainStorage,
      MainDisplay,
      MainMode
    },
    computed: {
      showTogglePanel () {
        return this.$store.state.UI.panelsVisible ? 'hide' : 'show'
      },
      toolbarTogglePanelsTitle () {
        return this.$store.state.UI.panelsVisible
          ? 'Cacher les consoles'
          : 'Afficher les consoles'
      }
    },
    methods: {
      doSite (url) {
        if (this.$$.electron && this.$$.electron.shell) {
          // we *are i electron
          this.$$.electron.shell.openExternal(url)
        } else {
          var win = window.open(url, '_blank')
          win.focus()
        }
      },
      doTogglePanelsVisible () {
        this.$store.commit('UI_SET_PANELS_VISIBLE', !this.$store.state.UI.panelsVisible)
      }
    }
  }
</script>
<style>
#toolbar-main {
  padding: 0.25rem;
  text-align: center;
  height: 3rem;
}
#toolbar-main .btn {
  padding: 0rem 0.5rem;
  height: 2.5rem;
  vertical-align: middle;
}
#toolbar-main .btn.eyo-display-packed:not(:last-child) {
  padding-right:0;
}
#toolbar-main .btn.eyo-display-packed:last-child {
  padding-left:0;
}
</style>
