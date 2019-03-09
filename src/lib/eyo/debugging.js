// Remove this file when done
// copy and override functions here.

eYo.ConnectionDelegate.prototype.updateCheck = function () {
  var eyo = this.connection.sourceBlock_.eyo
  if(this.changeCount === eyo.change.count) {
    return
  }
  this.changeCount = eyo.change.count
  if (this.model.check) {
    if (eYo.STOP !== undefined) {
      ++eYo.STOP
      if (eYo.STOP === 8) {
        console.error('STOP', eYo.STOP)
      }
    }
    this.connection.setCheck(this.model.check.apply(this, arguments))
  }
}

Blockly.Connection.prototype.disconnectInternal_ = function(parentBlock,
  childBlock) {
var event;
if (Blockly.Events.isEnabled()) {
  event = new Blockly.Events.BlockMove(childBlock);
}
var otherConnection = this.targetConnection;
otherConnection.targetConnection = null;
this.targetConnection = null;
childBlock.setParent(null);
if (event) {
  event.recordNew();
  Blockly.Events.fire(event);
}
};