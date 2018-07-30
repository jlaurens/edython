<template>
  <div id="toolbar-main">
    <b-button-toolbar key-nav  aria-label="Main toolbar" justify>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-site" v-on:click=" doSite('http://edython.eu')" title="Aller au site Edython" v-tippy>
          <img src="static/icon_light.svg" height="32" alt="Edython"/>
        </b-btn>
        <b-btn id="toolbar-debug" v-on:click="doSite('https://github.com/jlaurens/edython/issues')" title="Demander une correction, une amélioration" v-tippy>
          <icon-base :width="32" :height="32" icon-name="bug"><icon-bug /></icon-base>
        </b-btn>
        <b-dropdown-demo/>
      </b-button-group>
      <b-btn-group-storage />
      <b-button-group class="mx-1">
        <b-btn-run-python />
        <b-btn-copy-python />
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn-copy-paste :copy="false" :duplicate="true" />
        <b-btn-copy-paste :copy="true" :deep="false" />
        <b-btn-copy-paste :copy="true" :deep="true" />
        <b-btn-copy-paste :copy="false" />
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn-undo-redo :redo="false" />
        <b-btn-undo-redo :redo="true" />
      </b-button-group>
      <b-btn-group-layout />
      <!--b-button-group class="mx-1">
        <b-btn id="toolbar-toggle-panels" v-on:click="doTogglePanelsVisible()" :title="toolbarTogglePanelsTitle" v-tippy>
          <icon-base :width="32" :height="32" icon-name="toggle"><icon-toggle-panels :variant="showTogglePanel" /></icon-base>
        </b-btn>
      </b-button-group-->
      <b-dropdown-menu />
    </b-button-toolbar>
  </div>
</template>

<script>
  import ToolbarMenu from './Main/Menu.vue'
  import ToolbarUndoRedo from './Main/UndoRedo.vue'
  import ToolbarDemo from './Main/Demo.vue'
  import CopyPaste from './Main/CopyPaste.vue'
  import RunPython from './Main/RunPython.vue'
  import CopyPython from './Main/CopyPython.vue'
  import Storage from './Main/Storage.vue'
  import Layout from './Main/Layout.vue'
  
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
      'b-dropdown-menu': ToolbarMenu,
      'b-btn-undo-redo': ToolbarUndoRedo,
      'b-dropdown-demo': ToolbarDemo,
      'b-btn-copy-paste': CopyPaste,
      'b-btn-run-python': RunPython,
      'b-btn-copy-python': CopyPython,
      'b-btn-group-storage': Storage,
      'b-btn-group-layout': Layout
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
</style>
