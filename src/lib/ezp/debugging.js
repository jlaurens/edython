// Remove this file when done
// copy and override functions here.
Blockly.FieldLabel = function(text, opt_class) {
  this.size_ = new goog.math.Size(0, 17.5);
  this.class_ = opt_class;
  this.setValue(text);
};
