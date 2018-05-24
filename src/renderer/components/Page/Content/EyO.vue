<template>
  <div id='content-eyo'>
    <eyo-workspace></eyo-workspace>
  </div>
</template>

<script>
  import EyOWorkspace from './EyO/Workspace'
  // const toolbarData = require('assets/eyo/toolbar.xml')
  // const workspaceData = require('assets/eyo/workspace.xml')

  export default {
    name: 'content-eyo',
    components: {
      'eyo-workspace': EyOWorkspace
    },
    methods: {
      resize: function (e) {
        // Compute the absolute coordinates and dimensions of eyoArea.
        var eyoArea = document.getElementById('content-eyo')
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
  #content-eyo {
    margin: 0;
    padding: 0;
    border-radius: 8px;
    background-color: white;
    height: 100%;
  }

  #eyo-workspace {
    position: absolute;
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