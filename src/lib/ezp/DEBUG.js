// Remove this file when done
// copy and override functions here.

ezP.DelegateSvg.Expr.import_module.preInitSvg = function (block) {
  ezP.DelegateSvg.Expr.import_module.superClass_.preInitSvg.call(this, block)
}

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
Blockly.BlockSvg.prototype.setParent = function(newParent) {
  if (newParent == this.parentBlock_) {
    return;
  }
  var svgRoot = this.getSvgRoot();
  if (this.parentBlock_ && svgRoot) {
    // Move this block up the DOM.  Keep track of x/y translations.
    var xy = this.getRelativeToSurfaceXY();
    this.workspace.getCanvas().appendChild(svgRoot);
    svgRoot.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')');
  }

  Blockly.Field.startCache();
  Blockly.BlockSvg.superClass_.setParent.call(this, newParent);
  Blockly.Field.stopCache();

  if (newParent) {
    var oldXY = this.getRelativeToSurfaceXY();
    newParent.getSvgRoot().appendChild(svgRoot);
    var newXY = this.getRelativeToSurfaceXY();
    // Move the connections to match the child's new position.
    this.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y);
  }
};
