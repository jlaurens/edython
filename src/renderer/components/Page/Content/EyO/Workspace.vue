<template>
  <div id='eyo-workspace'>
    <eyo-workspace-toolbar></eyo-workspace-toolbar>
    <eyo-workspace-content></eyo-workspace-content>
  </div>
</template>

<script>
  import EyOWorkspaceToolbar from './Workspace/Toolbar'
  import EyOWorkspaceContent from './Workspace/Content'

  export default {
    name: 'eyo-workspace',
    components: {
      'eyo-workspace-content': EyOWorkspaceContent,
      'eyo-workspace-toolbar': EyOWorkspaceToolbar
    },
    methods: {
      resize: function (e) {
        // Compute the absolute coordinates and dimensions of eyoArea.
        var eyoArea = document.getElementById('eyo-content')
        var element = eyoArea
        var x = 0
        var y = 0
        do {
          x += element.offsetLeft
          y += element.offsetTop
          element = element.offsetParent
        } while (element)
        // Position eyoDiv over eyoArea.
        var eyoDiv = window.document.getElementById('eyo-workspace')
        eyoDiv.style.left = x + 'px'
        eyoDiv.style.top = y + 'px'
        eyoDiv.style.width = eyoArea.offsetWidth + 'px'
        eyoDiv.style.height = eyoArea.offsetHeight + 'px'
        if (window.Blockly) {
          window.Blockly.svgResize(window.eYo.workspace)
        }
      }
    },
    mounted: function () {
      window.addEventListener('resize', this.resize, false)
      var self = this
      this.$nextTick(function () {
        eYo.App.bus.$on('size-did-change', self.resize)
        self.resize()
      })
    }
  }
</script>

<style>

  #eyo-workspace {
  }

  .eyoMainBackground {
    /* stroke-width: 1; */
    stroke: none;
  }

  .eyoSvg {
    background-color: transparent;
  }

  .eyoToolboxDiv {
    border-radius: 8px 0 0 8px;
  }
</style>