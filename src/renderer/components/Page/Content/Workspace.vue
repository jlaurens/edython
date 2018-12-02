<template>
  <div
    id="eyo-wrapper"
    ref="wrapper">
    <div id="eyo-workspace"
      ref="workspace">
      <workspace-toolbar></workspace-toolbar>
      <workspace-content></workspace-content>
    </div>
  </div>
</template>

<script>
  import WorkspaceToolbar from './Workspace/Toolbar'
  import WorkspaceContent from './Workspace/Content'

  export default {
    name: 'workspace',
    components: {
      WorkspaceToolbar,
      WorkspaceContent
    },
    mounted: function () {
      window.addEventListener('resize', this.$$resize, false)
      this.$nextTick(() => {
        eYo.$$.bus.$on('size-did-change', this.$$resize)
        this.$$resize()
      })
    },
    methods: {
      $$resize: function (e) {
        // Compute the absolute coordinates and dimensions of wrapper.
        var wrapper = this.$refs.wrapper
        var element = wrapper
        var x = 0
        var y = 0
        do {
          x += element.offsetLeft
          y += element.offsetTop
          element = element.offsetParent
        } while (element)
        // Position workspace over wrapper.
        var workspace = this.$refs.workspace
        workspace.style.left = x + 'px'
        workspace.style.top = y + 'px'
        workspace.style.width = wrapper.offsetWidth + 'px'
        workspace.style.height = wrapper.offsetHeight + 'px'
        if (Blockly && eYo.App.workspace) {
          Blockly.svgResize(eYo.App.workspace)
        }
      }
    }
  }
</script>

<style>
  #eyo-wrapper {
    border-radius: 20px;
    background-color: white;
    height: 100%;
  }
</style>