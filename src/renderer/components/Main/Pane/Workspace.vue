<template>
  <div
    class="eyo-wrapper"
    ref="wrapper">
    <div
      class="eyo-workspace"
      ref="workspace">
      <toolbar
        :where="where"
        what="workspace"
        v-on="$listeners"></toolbar>
      <workspace-content></workspace-content>  
    </div>
  </div>
</template>

<script>
  import Toolbar from './Toolbar'
  import WorkspaceContent from './Workspace/Content'

  export default {
    name: 'workspace',
    components: {
      Toolbar,
      WorkspaceContent
    },
    props: {
      where: {
        type: String,
        default: undefined
      }
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
        workspace.style.left = `${x}px`
        workspace.style.top = `${y}px`
        workspace.style.width = `${wrapper.offsetWidth}px`
        workspace.style.height = `${wrapper.offsetHeight}px`
        if (Blockly && eYo.App.workspace) {
          Blockly.svgResize(eYo.App.workspace)
        }
      }
    }
  }
</script>

<style>
  .eyo-wrapper {
    background-color: transparent;
    height: 100%;
  }
  .eyo-wrapper .content {
    height: calc(100% - 1.75rem);
    margin: 0;
    padding: 0;
    border-radius: 0px;
    padding-top: 0.25rem;
  }
</style>