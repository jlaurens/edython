<template>
  <div id='content-blockly'>
    <blockly-workspace></blockly-workspace>
  </div>
</template>

<script>
  import BlocklyWorkspace from './Blockly/Workspace'
  const toolbarData = require('assets/blockly/toolbar.xml')
  const workspaceData = require('assets/blockly/workspace.xml')

  export default {
    name: 'content-blockly',
    components: {
      'blockly-workspace': BlocklyWorkspace
    },
    methods: {
      resize: function (e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var blocklyArea = document.getElementById('content-blockly')
        var element = blocklyArea
        var x = 0
        var y = 0
        do {
          x += element.offsetLeft
          y += element.offsetTop
          element = element.offsetParent
        } while (element)
        // Position blocklyDiv over blocklyArea.
        var blocklyDiv = window.document.getElementById('blockly-workspace')
        blocklyDiv.style.left = x + 'px'
        blocklyDiv.style.top = y + 'px'
        blocklyDiv.style.width = blocklyArea.offsetWidth + 'px'
        blocklyDiv.style.height = blocklyArea.offsetHeight + 'px'
        if (window.Blockly) {
          window.Blockly.svgResize(window.edY.workspace)
        }
      }
    },
    mounted: function () {
      var edY = window.edY
      edY.Vue.getBus().$on('size-did-change', this.resize)
      window.addEventListener('resize', this.resize, false)
      var Blockly = window.Blockly
      if (Blockly) {
        var self = this
        this.$nextTick(function () {
          // Code that will run only after the
          // entire view has been rendered
          self.options = {
            collapse: true,
            comments: false,
            disable: true,
            maxBlocks: Infinity,
            trashcan: false,
            horizontalLayout: false,
            toolboxPosition: 'start',
            css: true,
            media: 'src/lib/blockly/media/',
            rtl: false,
            scrollbars: true,
            sounds: true,
            oneBasedIndex: true
          }
          // toolbarData: module.exports = "blablabla"
          var dom = Blockly.Xml.textToDom(toolbarData)
          self.options.toolbox = dom
          let blocklyDiv = document.getElementById('blockly-workspace')
          edY.workspace = Blockly.inject(blocklyDiv, self.options)
          edY.setup(edY.workspace)
          dom = Blockly.Xml.textToDom(workspaceData)
          Blockly.Xml.domToWorkspace(dom, edY.workspace)
          self.resize()
          var b = edY.workspace.newBlock(edY.Const.Grp.FOR)
          b.initSvg()
          b.moveBy(50, 150)
          b.render()
          b = edY.workspace.newBlock(edY.Const.Val.GET)
          b.initSvg()
          b.moveBy(50, 100)
          b.render()
          /* function generate () {
            var code = Blockly.Python.workspaceToCode(edY.workspace)
            window.document.getElementById('edy_code_output').value = code
          } */
        })
      }
    }
  }
</script>

<style>
  #content-blockly {
    margin: 0;
    padding: 0;
    border-radius: 8px;
    background-color: white;
    height: 100%;
  }

  #blockly-workspace {
    position: absolute;
  }

  .blocklyMainBackground {
    /* stroke-width: 1; */
    stroke: none;
  }

  .blocklySvg {
    background-color: transparent;
  }

  .blocklyToolboxDiv {
    border-radius: 8px 0 0 8px;
  }
</style>