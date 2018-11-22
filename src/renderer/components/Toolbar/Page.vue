<template>
  <b-btn-toolbar id="page-toolbar" key-nav  aria-label="Page toolbar" justify>
    <b-btn-group>
      <b-btn id="toolbar-site" v-on:click=" doSite('http://edython.eu')" title="Aller au site Edython" v-tippy>
        <img src="static/icon_light.svg" height="32" alt="Edython"/>
      </b-btn>
      <b-btn id="page-toolbar-debug" v-on:click="doSite('https://github.com/jlaurens/edython/issues')" title="Demander une correction, une amélioration" v-tippy>
        <icon-base icon-name="bug"><icon-bug /></icon-base>
      </b-btn>
      <page-demo/>
    </b-btn-group>
    <b-btn-group>
      <page-mode />
      <page-display />
    </b-btn-group>
    <page-storage />
    <b-btn-group>
      <run-python />
      <copy-python />
    </b-btn-group>
    <copy-paste />
    <b-btn-group>
      <page-undo-redo :redo="false" />
      <page-undo-redo :redo="true" />
    </b-btn-group>
    <page-menu />
  </b-btn-toolbar>
</template>

<script>
  import PageMenu from './Page/Menu.vue'
  import PageUndoRedo from './Page/UndoRedo.vue'
  import PageDemo from './Page/Demo.vue'
  import RunPython from './Page/RunPython.vue'
  import CopyPaste from './Page/CopyPaste.vue'
  import CopyPython from './Page/CopyPython.vue'
  import PageStorage from './Page/Storage.vue'
  import PageDisplay from './Page/Display.vue'
  import PageMode from './Page/Mode.vue'
  
  import IconBase from '@@/Icon/IconBase.vue'
  import IconBug from '@@/Icon/IconBug.vue'
  import IconTogglePanels from '@@/Icon/IconTogglePanels.vue'

  export default {
    name: 'page-toolbar',
    data: function () {
      return {
        selected: this.$$.eYo.App.CONSOLE,
        titles: {
          console: this.$$.eYo.App.CONSOLE,
          turtle: this.$$.eYo.App.Turtle
        }
      }
    },
    components: {
      IconBase,
      IconBug,
      IconTogglePanels,
      PageMenu,
      PageUndoRedo,
      PageDemo,
      RunPython,
      CopyPaste,
      CopyPython,
      PageStorage,
      PageDisplay,
      PageMode
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
      }
    }
  }
</script>
<style>
#page-toolbar {
  text-align: center;
  height: 3rem;
  padding: 0.25rem 0;
}
#page-toolbar .btn {
  height: 2.5rem;
  vertical-align: middle;
  padding: 0.25rem 0.5rem;
}
#page-toolbar .btn-group {
  margin: 0 0.25rem;
}
#page-toolbar .btn-group .btn-group {
  margin: 0;
}
#page-toolbar .btn.eyo-display-packed:not(:last-child) {
  padding-right:0;
}
#page-toolbar .btn.eyo-display-packed:last-child {
  padding-left:0;
}
.eyo-dropdown .btn {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: left;
  padding-top: 0px;
  padding-bottom: 0px;
  vertical-align: baseline;
}
</style>
