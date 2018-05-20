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
      var b = eYo.DelegateSvg.newBlockReady(eYo.workspace, eYo.T3.Stmt.start_stmt)
      b.moveBy(50, 150)
      function temp () {
        var flyout = new eYo.Flyout({parentWorkspace: eYo.workspace})
        goog.dom.insertSiblingAfter(
          flyout.createDom('svg'), eYo.workspace.getParentSvg())
        // workspace.flyout_ = flyout does not work, flyout too big
        flyout.init(eYo.workspace)
        flyout.autoClose = false
        Blockly.Events.disable()
        try {
          flyout.show(eYo.DelegateSvg.T3s)//, seYo.T3.Expr.key_datum, eYo.T3.Stmt.if_part
        } catch (err) {
          console.log(err)
        } finally {
          Blockly.Events.enable()
        }
        // eYo.workspace.flyout_ = flyout
        eYo.flyout = flyout
      }
      temp()
      eYo.workspace.render()
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
