// Remove this file when done
// copy and override functions here.

eYo.DBG = {}

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to add.
 */
eYo.Workspace.prototype.addTopBlock = function(block) {
  if (block.type === eYo.T3.Stmt.expression_stmt) {
    console.error('addTopBlock', block.type)
  }
  if (this.rendered) {
    block.eyo.beReady()
  }
  this.topBlocks_.push(block)
}

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  console.error('removeTopBlock', block.type)
  if (!goog.array.remove(this.topBlocks_, block)) {
    throw 'Block not present in workspace\'s list of top-most blocks.';
  }
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.Block} newParent New parent block or null.
 */
Blockly.Block.prototype.setParent = (() => {
  var setParent = Blockly.Block.prototype.setParent
  return function(newParent) {
    if (newParent !== this.parentBlock_) {
      var ui = this.ui
      ui && ui.parentWillChange(newParent)
      var oldParent = this.parentBlock_
      if (newParent) {
        console.error('WILL REMOVE FROM TOP BLOCK')
      }
      setParent.call(this, newParent)
      if (newParent) {
        console.error('DID REMOVE FROM TOP BLOCKS?')
      }
      ui && ui.parentDidChange(oldParent)
    }
  }
})()

/**
 * Make the current index unique.
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.prototype.makeUnique = function (io) {
  console.log('makeUnique IN')
  if (!this.reentrant.makeUnique) {
    var f = this.model.makeUnique
    if (goog.isFunction(f)) {
      console.log('makeUnique IN this.model.makeUnique')
      this.reentrant.makeUnique = true
      try {
        if (f.call(this, io)) {
          io.unique = io.i
        }
      } finally {
        this.reentrant.makeUnique = false
      }
      return
    }
  }
  if (this.model.unique && io.c8n.targetConnection) {
    console.log('makeUnique IN this.model.makeUnique')
    var unique = this.model.unique(io.block.type, io.block.eyo.subtype)
    if (!unique) {
      throw `MISSING UNIQUE ${this.model.unique(io.block.type, io.block.eyo.subtype)}`
    } else if (io.c8n.targetConnection.check_.some(x => unique && unique.indexOf(x) >= 0)) {
      io.unique = io.i
    }
  }
  console.log('makeUnique OUT', io.unique)
}

/**
 * Complete with a wrapped block.
 * Reentrant method.
 * @param {String} prototypeName
 * @return {Object} Object with an `ans` property.
 */
eYo.ConnectionDelegate.prototype.completeWrap = eYo.Decorate.reentrant_method(
  'completeWrap',
  function () {
    if (!this.wrapped_) {
      return
    }
    var c8n = this.connection
    var target = c8n.targetBlock()
    if (!target) {
      var ans
      eYo.Events.disableWrap(
        () => {
          var b_eyo = c8n.eyo.b_eyo
          if (!b_eyo) {
            b_eyo = c8n.eyo.b_eyo
          }
          target = eYo.DelegateSvg.newBlockComplete(b_eyo, this.wrapped_, b_eyo.id + '.wrapped:' + this.name_)
          goog.asserts.assert(target, 'completeWrap failed: ' + this.wrapped_)
          goog.asserts.assert(target.outputConnection, 'Did you declare an Expr block typed ' + target.type)
          ans = this.connect(target.outputConnection)
          if (this.isReady) {
            target.eyo.beReady()
            target.eyo.ui.updateWrapped()
          }
        }
      )
      return ans // true when connected
    }
  }
)

Object.defineProperties(eYo.Block.prototype, {
  workspace: {
    get () {
      return this.workspace_
    },
    set (newValue) {
      if (!newValue) {
        console.error('Removing the workspace')
      }
      this.workspace_ = newValue
    }
  }
})