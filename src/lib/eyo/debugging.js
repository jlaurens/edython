// Remove this file when done
// copy and override functions here.

eYo.DBG = {}

eYo.DBG.setCheck = 0
/**
 * Change a connection's compatibility.
 * Edython: always use `onCheckChanged_`
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
eYo.Connection.prototype.setCheck = function(check) {
  if (this.eyo.isLeft && (!check || !check.length)) {
    console.error('setCheck', eYo.DBG.setCheck++)
  }
  eYo.Connection.superClass_.setCheck.call(this, check)
  if (!check) {
    // This was not called on original Blockly
    this.onCheckChanged_()
  }
  return this
}

eYo.DBG.setTargetConnection = 0
Object.defineProperties(eYo.Connection.prototype, {
  targetConnection: {
    get () {
      return this.targetConnection_
    },
    set (newValue) {
      if (!newValue) {
        console.error('set targetConnection', eYo.DBG.setTargetConnection++)
      }
      this.targetConnection_ = newValue
    }
  },
  check_: {
    get () {
      return this.check__
    },
    set (newValue) {
      if (newValue && !newValue.length) {
        console.error('setCheck []')
      }
      this.check__ = newValue
    }
  }
})
