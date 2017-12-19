<template>
  <div id='content-blockly'>
    <blockly-workspace></blockly-workspace>
  </div>
</template>

<script>
  import BlocklyWorkspace from './Blockly/Workspace'
  // eslint-disable-next-line import/no-webpack-loader-syntax
  import toolbarData from 'raw-loader!../../../../../static/blockly/toolbar.xml'
  // eslint-disable-next-line import/no-webpack-loader-syntax
  import workspaceData from 'raw-loader!../../../../../static/blockly/workspace.xml'
  // import fs from 'fs'
  // import path from 'path'

  export default {
    name: 'content-blockly',
    components: {
      'blockly-workspace': BlocklyWorkspace
    },
    methods: {
      resize (e) {
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
        window.Blockly.svgResize(window.ezP.workspace)
      }
    },
    mounted: function () {
      window.ezP.Vue.getBus().$on('size-did-change', this.resize)
      window.addEventListener('resize', this.resize, false)
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
        var dom = window.Blockly.Xml.textToDom(toolbarData)
        self.options.toolbox = dom
        let blocklyDiv = document.getElementById('blockly-workspace')
        window.ezP.workspace = window.Blockly.inject(blocklyDiv, self.options)
        window.ezP.setup(window.ezP.workspace)
        dom = window.Blockly.Xml.textToDom(workspaceData)
        window.Blockly.Xml.domToWorkspace(dom, window.ezP.workspace)
        self.resize()
        var b = window.ezP.workspace.newBlock(window.ezP.Const.Grp.FOR)
        b.initSvg()
        b.moveBy(50, 150)
        b.render()
        b = window.ezP.workspace.newBlock(window.ezP.Const.Val.GET)
        b.initSvg()
        b.moveBy(50, 100)
        b.render()
        /* function generate () {
          var code = window.Blockly.Python.workspaceToCode(window.ezP.workspace)
          window.document.getElementById('ezp_code_output').value = code
        } */
      })
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