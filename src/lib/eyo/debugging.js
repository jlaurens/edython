// Remove this file when done
// copy and override functions here.
eYo.FieldInput.prototype.setVisible = function (yorn) {
  if(this.name === 'bind' && !yorn && this.getDisplayText_() === 'expression') {
    console.error('HIDE BIND')
  }
  eYo.FieldInput.superClass_.setVisible.call(this, yorn)
}