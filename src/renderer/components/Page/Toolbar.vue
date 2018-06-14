<template>
  <div id="toolbar">
    <b-button-toolbar key-nav  aria-label="Main toolbar">
        <b-button-group class="mx-1">
          <b-btn v-on:click="doSite()">
            <img src="static/icon.svg" height="32" alt="Edython"/>
          </b-btn>
        </b-button-group>
        <b-button-group class="mx-1">
        <b-btn v-on:click="doNew()">
          <icon-base width="32" height="32" icon-name="new"><icon-new /></icon-base>
        </b-btn>
        <b-btn v-on:click="doSave()">
          <icon-base width="32" height="32" icon-name="save"><icon-save /></icon-base>
        </b-btn>
        <b-btn>
          <icon-base width="32" height="32" icon-name="load"><icon-load /></icon-base>
        </b-btn>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn v-on:click="doCopy()">
          <icon-base width="32" height="32" icon-name="copy"><icon-copy-paste variant="copy" /></icon-base>
        </b-btn>
        <b-btn v-on:click="doPaste()">
          <icon-base width="32" height="32" icon-name="paste"><icon-copy-paste variant="paste"/></icon-base>
        </b-btn>
        <b-btn v-on:click="doCopyPythonCode()">
          <icon-base width="32" height="32" icon-name="copy Python"><icon-copy-python /></icon-base>
        </b-btn>
        <b-btn v-on:click="doUndo()" :disabled="!canUndo">
          <icon-base width="32" height="32" icon-name="undo"><icon-undo-redo variant="undo"/></icon-base>
        </b-btn>
        <b-btn id="toolbar-redo" v-on:click="doRedo()" :disabled="!canRedo">
          <icon-base width="32" height="32"  icon-name="redo"><icon-undo-redo variant="redo"/></icon-base>
        </b-btn>
      </b-button-group>
    </b-button-toolbar>
  </div>
</template>

<script>
  import IconBase from '../IconBase.vue'
  import IconNew from '../Icon/IconNew.vue'
  import IconSave from '../Icon/IconSave.vue'
  import IconLoad from '../Icon/IconLoad.vue'
  import IconUndoRedo from '../Icon/IconUndoRedo.vue'
  import IconCopyPaste from '../Icon/IconCopyPaste.vue'
  import IconCopyPython from '../Icon/IconCopyPython.vue'
  
  export default {
    name: 'page-toolbar',
    data: function () {
      return {
        activeElement: null,
        workspace: null
      }
    },
    components: {
      IconBase,
      IconNew,
      IconLoad,
      IconSave,
      IconUndoRedo,
      IconCopyPaste,
      IconCopyPython
    },
    methods: {
      doSite: function () {
        var url = 'https://github.com/jlaurens/edython/'
        if (this.electron && this.electron.shell) {
          this.electron.shell.openExternal(url)
        } else {
          var win = window.open(url, '_blank')
          win.focus()
        }
      },
      canUndo: function () {
        console.log(eYo.App.workspace.undoStack_.length)
        return eYo.App.workspace && (eYo.App.workspace.undoStack_.length > 0)
      },
      canRedo: function () {
        return eYo.App.workspace && (eYo.App.workspace.redoStack_.length > 0)
      },
      doUndo: function () {
        eYo.App.workspace.undo()
      },
      doRedo: function () {
        eYo.App.workspace.undo(true)
      },
      doCopy: function () {
        window.Blockly.selected && window.Blockly.copy_(window.Blockly.selected)
      },
      doPaste: function () {
        window.Blockly.clipboardXml_ && eYo.App.workspace.paste(window.Blockly.clipboardXml_)
      },
      doCopyPythonCode: function () {
        var block = window.Blockly.selected
        if (block) {
          var p = new window.eYo.PythonExporter()
          var code = p.export(block, true)
          window.eYo.App.copyTextToClipboard(code)
        }
      },
      doNew: function () {
        eYo.App.bus.$emit('new-document')
        eYo.App.workspace.clearUndo()
        eYo.App.documentName = window.prompt('Nom du document ?')
      },
      doSave: function () {
        var dom = eYo.Xml.workspaceToDom(eYo.App.workspace, true)
        var oSerializer = new XMLSerializer()
        var str = oSerializer.serializeToString(dom)
        var deflate = this.pako.deflate(str)
        str = this.pako.inflate(deflate, {to: 'string'})
        console.log(str.length, deflate.length, str)
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
