// Remove this file when done
// copy and override functions here.


/**
 * Handle a change to the editor.
 * @param {!Event} _e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(_e) {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  // Update source block.
  var text = htmlInput.value;
  if (text !== htmlInput.oldValue_) {
    htmlInput.oldValue_ = text;
    this.setValue(text);
    this.validate_();
  } else if (goog.userAgent.WEBKIT) {
    // Cursor key.  Render the source block to show the caret moving.
    // Chrome only (version 26, OS X).
    this.sourceBlock_.render();
  }
  this.resizeEditor_();
  Blockly.svgResize(this.sourceBlock_.workspace);
};
