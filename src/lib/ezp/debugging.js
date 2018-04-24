// Remove this file when done
// copy and override functions here.
/**
 * Set the value of this field.
 * @param {?string} newValue New value.
 * @override
 */
Blockly.FieldTextInput.prototype.setValue = function(newValue) {
  if (newValue === null) {
    return;  // No change if null.
  }
  if (this.sourceBlock_) {
    var validated = this.callValidator(newValue);
    // If the new value is invalid, validation returns null.
    // In this case we still want to display the illegal result.
    if (validated !== null) {
      newValue = validated;
    }
  }
  Blockly.Field.prototype.setValue.call(this, newValue);
};
