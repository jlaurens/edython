// Remove this file when done
// copy and override functions here.

/**
 * Disconnect two blocks that are connected by this connection.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 */
Blockly.Connection.prototype.disconnectInternal_ = function(parentBlock,
  childBlock) {
  var event;
  if (Blockly.Events.isEnabled()) {
    event = new Blockly.Events.BlockMove(childBlock);
  }
  var otherConnection = this.targetConnection;
  console.error('disconnectInternal_', this.eyo.INFO, otherConnection.eyo.INFO)
  otherConnection.targetConnection = null;
  this.targetConnection = null;
  childBlock.setParent(null);
  if (event) {
    event.recordNew();
    Blockly.Events.fire(event);
  }
};


/**
 * Sever all links to this connection (not including from the source object).
 */
Blockly.Connection.prototype.dispose = function() {
  if (this.isConnected()) {
    console.error('should be disconnected', this.eyo.INFO)
    throw 'Disconnect connection before disposing of it.';
  }
  if (this.inDB_) {
    this.db_.removeConnection_(this);
  }
  this.db_ = null;
  this.dbOpposite_ = null;
};
