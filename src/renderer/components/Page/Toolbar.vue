<template>
  <div id="toolbar">
    <b-button-toolbar key-nav  aria-label="Main toolbar" justify>
      <b-button-group class="mx-1">
        <b-btn id="toolbar-site" v-on:click=" doSite('https://github.com/jlaurens/edython/')" title="Aller au site Edython" v-tippy>
          <img src="static/icon_light.svg" height="32" alt="Edython"/>
        </b-btn>
        <b-btn id="toolbar-debug" v-on:click="doSite('https://github.com/jlaurens/edython/issues')" title="Demander une correction, une amélioration" v-tippy>
          <icon-base :width="32" :height="32" icon-name="bug"><icon-bug /></icon-base>
        </b-btn>
        <b-dropdown-demo/>
      </b-button-group>
      <b-btn-group-storage />
      <b-button-group class="mx-1">
        <b-btn-undo-redo :redo="false" />
        <b-btn-undo-redo :redo="true" />
      </b-button-group>
      <b-button-group class="mx-1">
        <b-button-copy-paste :copy="true" :deep="false" />
        <b-button-copy-paste :copy="true" :deep="true" />
        <b-button-copy-paste :copy="false" />
        <b-btn id="toolbar-python" v-on:click="doCopyPythonCode()" title="Copier le code python" v-tippy>
          <icon-base :width="32" :height="32" icon-name="copy Python"><icon-copy-python /></icon-base>
        </b-btn>
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
  import ToolbarMenu from './Toolbar/Menu.vue'
  import ToolbarUndoRedo from './Toolbar/UndoRedo.vue'
  import ToolbarDemo from './Toolbar/Demo.vue'
  import CopyPaste from './Toolbar/CopyPaste.vue'
  import Storage from './Toolbar/Storage.vue'
  import Layout from './Toolbar/Layout.vue'
  
  import IconBase from '@@/IconBase.vue'
  import IconBug from '@@/Icon/IconBug.vue'
  import IconCopyPython from '@@/Icon/IconCopyPython.vue'
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
      IconCopyPython,
      IconTogglePanels,
      'b-dropdown-menu': ToolbarMenu,
      'b-btn-undo-redo': ToolbarUndoRedo,
      'b-dropdown-demo': ToolbarDemo,
      'b-button-copy-paste': CopyPaste,
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
        if (this.electron && this.electron.shell) {
          this.electron.shell.openExternal(url)
        } else {
          var win = window.open(url, '_blank')
          win.focus()
        }
      },
      doCopyPythonCode: function () {
        var block = Blockly.selected
        if (block) {
          var p = new eYo.PythonExporter()
          var code = p.export(block, true)
          eYo.App.copyTextToClipboard(code)
        }
      },
      doTogglePanelsVisible () {
        this.$store.commit('UI_SET_PANELS_VISIBLE', !this.$store.state.UI.panelsVisible)
      }
    }
  }
</script>
<style>
#toolbar {
  padding: 0.25rem;
  text-align:center;
  height: 3rem;
}
#toolbar .btn {
  padding: 0rem 0.5rem;
  height: 2.5rem;
  vertical-align:middle;
}
</style>
