// Remove this file when done
// copy and override functions here.

/**
 * Sets whether this editable field is visible or not.
 * @param {boolean} visible True if visible.
 */
Blockly.Field.prototype.setVisible = function(visible) {
  if (this.name === 'bind' && !visible) {
    console.error('INVISIBLE')
  }
  if (this.visible_ == visible) {
    return;
  }
  this.visible_ = visible;
  var root = this.getSvgRoot();
  if (root) {
    root.style.display = visible ? 'block' : 'none';
    this.render_();
  }
};
