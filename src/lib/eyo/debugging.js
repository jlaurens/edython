// Remove this file when done
// copy and override functions here.

Object.defineProperties(eYo.Connection.prototype, {
  targetConnection: {
    get () {
      return this.targetConnection___
    },
    set (newValue) {
      console.warn('TARGET CONNECTION', this.eyo.b_eyo.type, newValue)
      if(newValue === null) {
        console.error('WHY?')
      }
      this.targetConnection___ = newValue
    }
  }
})


/**
 * Function to be called when this connection's compatible types have changed.
 * @private
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function() {
  // The new value type may not be compatible with the existing connection.
  if (this.isConnected() && !this.checkType_(this.targetConnection)) {
    var child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
    console.error('UNEXPECTED')
    this.checkType_(this.targetConnection)
    child.unplug();
    // Bump away.
    this.sourceBlock_.bumpNeighbours_();
  }
};
