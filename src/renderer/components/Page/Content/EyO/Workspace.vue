<template>
  <div id="eyo-workspace">
  </div>
</template>

<script>
  export default {
    name: 'eyo-workspace',
    mounted: function () {
      var options = {
        collapse: true,
        comments: false,
        disable: true,
        maxBlocks: Infinity,
        trashcan: false,
        horizontalLayout: false,
        toolboxPosition: 'start',
        css: true,
        media: 'static/media/',
        rtl: false,
        scrollbars: true,
        sounds: true,
        oneBasedIndex: true
      }
      eYo.workspace = Blockly.inject('eyo-workspace', options)
      eYo.setup(eYo.workspace)
      eYo.workspace.eyo.Xoptions = {
        noLeftSeparator: true,
        noDynamicList: true
      }
      eYo.KeyHandler.setup(document)
      var b = eYo.DelegateSvg.newBlockReady(eYo.workspace, eYo.T3.Expr.term)
      b.moveBy(50, 150)
    }
  }
</script>

<style>
  #eyo-workspace {
    margin: 0;
    padding: 0;
    border-radius: 8px;
    background-color: white;
    height: 100%;
  }
</style>
