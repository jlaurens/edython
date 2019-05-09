/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Extends connections.
 * Insert a class between Blockly.Connection and Blockly.RenderedConnection
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.RenderedConnection')

goog.forwardDeclare('eYo.Magnet')
goog.forwardDeclare('eYo.Selected')

goog.require('Blockly.RenderedConnection')
goog.require('Blockly.Connection')

goog.require('eYo.Const')
goog.require('eYo.Do')
goog.require('eYo.Where')
goog.require('eYo.T3')

/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
eYo.Connection = function (source, type) {
  eYo.Connection.superClass_.constructor.call(this, source, type)
}
goog.inherits(eYo.Connection, Blockly.Connection)
eYo.Do.inherits(Blockly.RenderedConnection, eYo.Connection)

/**
 * Every connection has a delegate.
 */
eYo.Connection.prototype.eyo = undefined

/**
 * Add highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.highlight = (() => {
  var highlight = Blockly.RenderedConnection.prototype.highlight
  return function () {
    if (this.eyo) {
      this.eyo.ui.highlightConnection(this.eyo)
      return
    }
    highlight.call(this)
  }  
}) ()

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.bumpAwayFrom_ = function (staticConnection) {
  if (!this.sourceBlock_.workspace || this.sourceBlock_.workspace.isDragging()) {
    // Don't move blocks around while the user is doing the same
    // or when they have been removed.
    return
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock()
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return
  }
  if (!rootBlock.workspace) {
    // Well we are in the process of deleting a block.
    // Beware of undo redo management.
    return
  }
  var reverse = false
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.getSourceBlock().getRootBlock()
    if (!rootBlock.workspace || !rootBlock.isMovable()) {
      return
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this
    reverse = true
  }
  // Raise it to the top for extra visibility.
  var selected = eYo.Selected.block === rootBlock
  selected || rootBlock.addSelect()
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS) - this.y_
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy
  }
  // Added by JL, I don't remember why...
  if (staticConnection.isConnected()) {
    dx += staticConnection.targetBlock().width
  }
  if (rootBlock.RTL) {
    dx = -dx
  }
  rootBlock.moveBy(dx, dy)
  selected || rootBlock.removeSelect()
}

Object.defineProperties(eYo.Connection.prototype, {
  check_: {
    get () {
      return this.eyo.check_
    },
    set (newValue) {
      this.eyo.check_ = newValue
    }
  },
  name_: {
    get () {
      return this.eyo.name_
    },
    set (newValue) {
      this.eyo.name_ = newValue
    }
  },
  // inDB_: {
  //   get () {
  //     return this.inDB__
  //   },
  //   set (newValue) {
  //     if (this.type === eYo.Const.RIGHT_STATEMENT) {
  //       console.error('inDB_ =', newValue)
  //     }
  //     this.inDB__ = newValue
  //   }
  // }
})

/**
 * Check if the two connections can be dragged to connect to each other.
 * A sealed connection is never allowed.
 * @param {!Blockly.Connection} candidate A nearby connection to check.
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
eYo.Connection.prototype.isConnectionAllowed = function (candidate) {
}

/**
 * Check if the two connections can be dragged to connect to each other.
 * A sealed connection is never allowed.
 * @param {!Blockly.Connection} candidate A nearby connection to check.
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
eYo.Connection.prototype.isConnectionAllowed = function (candidate) {
  if (this.eyo.wrapped_ || candidate.eyo.wrapped_) {
    return false
  }
  var yorn = eYo.Connection.superClass_.isConnectionAllowed.call(this,
    candidate)
  // if (yorn) {
  //   if (candidate.type == eYo.Const.LEFT_STATEMENT) {
  //     if (candidate.isConnected() || this.isConnected()) {
  //       return false;
  //     }
  //   }
  //   // Blocks may be terminal, like the return statement.
  //   if (this.type == eYo.Const.LEFT_STATEMENT &&
  //     !this.sourceBlock_.eyo.rightConnection &&
  //     candidate.isConnected() &&
  //     candidate.targetBlock().eyo.rightConnection) {
  //     return false;
  //   }
  // }
  return yorn
}

/**
 * Change a connection's compatibility.
 * Edython: always use `onCheckChanged_`
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
eYo.Connection.prototype.setCheck = function(check) {
  eYo.Connection.superClass_.setCheck.call(this, check)
  if (!check) {
    // This was not called on original Blockly
    this.onCheckChanged_()
  }
  return this
}

/**
 * The type checking mechanism is fine grained compared to blockly's.
 * The check_ is used more precisely.
 * For example, elif blocks cannot connect to the suite connection, only the next connection.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @param {?Boolean} force  checks even if a connection is hidden or incog.
 * @return {boolean} True if the connections share a type.
 * @private
 * @suppress {accessControls}
 */
eYo.Connection.prototype.checkType_ = function (otherConnection, force) {
  if (!Blockly.Events.recordUndo) {
    // we are undoing or redoing
    // we will most certainly reach a state that was valid
    // some time ago
    return true
  }
  if (this.check_ && !this.check_.length) {
    return false
  }
  if (otherConnection.check_ && !otherConnection.check_.length) {
    return false
  }
  var c8nA = this.eyo.blackMagnet.connection
  var c8nB = otherConnection.eyo.blackMagnet.connection
  if (!c8nA || !c8nB) {
    return true
  }
  var sourceA = c8nA.getSourceBlock()
  var sourceB = c8nB.getSourceBlock()
  // short stop if one of the connection is hidden or disabled
  // except when we try to establish a connection with a wrapped block.
  // in either case, returns true iff the connetion is aready established
  if (c8nA.eyo.wrapped_) {
    if (c8nA.targetConnection) {
      return c8nA === c8nB.targetConnection
    }
  } else if (c8nB.eyo.wrapped_) {
    if (c8nB.targetConnection) {
      return c8nB === c8nA.targetConnection
    }
  } else if (!force && sourceA.eyo.isready && sourceB.eyo.isready && (c8nA.eyo.incog_ || c8nB.eyo.incog_ || c8nA.eyo.hidden_ || c8nB.eyo.hidden_)) { // the `force` argument may be useless now that there is a readiness test.
    return c8nA === c8nB.targetConnection
  }
  var typeA = sourceA.eyo.type // the block type is not up to date
  var typeB = sourceB.eyo.type // the block type is not up to date
  if (typeA.indexOf('eyo:') === 0 && typeB.indexOf('eyo:') === 0) {
    var checkA = c8nA.check_
    var checkB = c8nB.check_
    if (c8nA.eyo.isInput) {
      // c8nA is the connection of an input
      if (sourceA.eyo.locked_) {
        return c8nA.targetConnection === c8nB
      }
      if (checkA) {
        if (checkB) {
          if (checkA.some(t => checkB.indexOf(t) >= 0)) {
            return true
          }
        } else {
          return checkA.indexOf(typeB) >= 0
        }
      }
      return true
    } /* if (c8nA.eyo.name_) */
    if (c8nB.eyo.isInput) {
      // c8nB is the connection of an input
      if (sourceB.eyo.locked_) {
        return c8nA === c8nB.targetConnection
      }
      if (checkB) {
        if (checkA) {
          if (checkB.some(t => checkA.indexOf(t) >= 0)) {
            return true
          }
        } else if (checkB.indexOf(typeA) < 0) {
          return false
        } else {
          return true
        }
      }
      return true
    } /* if (c8nB.eyo.name_) */
    if (checkA && checkA.indexOf(typeB) < 0) {
      return false
    }
    if (checkB && checkB.indexOf(typeA) < 0) {
      return false
    }
    return true
  }
  return eYo.Connection.superClass_.checkType_.call(this, otherConnection)
}

/**
 * Connect two connections together.  This is the connection on the superior
 * block.
 * Add hooks to allow customization.
 * @param {!Blockly.Connection} childC8n Connection on inferior block.
 * @private
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.connect_ = (() => {
  // this is a closure
  var connect_ = Blockly.RenderedConnection.prototype.connect_
  return function (childC8n) {
    // `this` is actually the parentC8n
    var parentC8n = this
    var parent = parentC8n.sourceBlock_
    var child = childC8n.sourceBlock_
    if (parent.workspace !== child.workspace) {
      return
    }
    var oldParentC8n = childC8n.targetConnection
    var oldChildC8n = parentC8n.targetConnection
    var p_eyo = parent.eyo // .wrapper
    var ch_eyo = child.eyo
    ch_eyo.changeWrap( // the child will cascade changes to the parent
      () => {
        p_eyo.beReady(ch_eyo.isReady)
        ch_eyo.beReady(p_eyo.isReady)
        parentC8n.eyo.willConnect(childC8n)
        eYo.Do.tryFinally(() => {
          childC8n.eyo.willConnect(parentC8n)
          eYo.Do.tryFinally(() => {
            p_eyo.willConnect(parentC8n, childC8n)
            eYo.Do.tryFinally(() => {
              ch_eyo.willConnect(childC8n, parentC8n)
              eYo.Do.tryFinally(() => {
                ch_eyo.beReady(parent.eyo.isReady)
                connect_.call(parentC8n, childC8n)
                if (parentC8n.eyo.plugged_) {
                  ch_eyo.plugged_ = parentC8n.eyo.plugged_
                }
                if (parentC8n.eyo.wrapped_) {
                  if (ch_eyo.uiHasSelect) {
                    child.unselect()
                    parent.eyo.select()
                  }
                  ch_eyo.wrapped_ = true
                } else {
                  // if this connection was selected, the newly connected block should be selected too
                  if (eYo.Selected.connection === parentC8n) {
                    P = parent.eyo
                    do {
                      if (P === eYo.Selected.eyo) {
                        child.select()
                        break
                      }
                    } while ((P = P.group))
                  }
                }
                if (oldChildC8n && childC8n !== oldChildC8n) {
                  var oldChild = oldChildC8n.sourceBlock_
                  if (oldChild) {
                    if (oldChild.eyo.wrapped_) {
                      if (Blockly.Events.recordUndo) {
                        oldChild.dispose(true)
                      }
                    } else if (!oldChildC8n.targetBlock()) {
                      // another chance to reconnect the orphan
                      // just in case the check_ has changed in between
                      // which might be the case for the else_part blocks
                      if (oldChildC8n.eyo.isOutput) {
                        var do_it = x => {
                          if (!x.isIncog || !x.isIncog()) {
                            var c8n, target
                            if ((c8n = x.connection)) {
                              if (c8n.eyo.hidden_ && !c8n.eyo.wrapped_) {
                                return
                              }
                              if ((target = c8n.targetBlock())) {
                                if (plug(target.eyo)) {
                                  return true
                                }
                              } else if (c8n.checkType_(oldChildC8n)) {
                                c8n.connect(oldChildC8n)
                                return true
                              }
                            }
                          }
                        }
                        var plug = (eyo) => {
                          return eyo instanceof eYo.DelegateSvg.List
                          ? eyo.someInput(do_it)
                          : eyo.someSlot(do_it)
                        }
                        plug(ch_eyo)
                      } else {
                        P = child
                        var c8n
                        while ((c8n = P.nextConnection)) {
                          if ((P = c8n.targetBlock())) {
                            continue
                          } else if (c8n.checkType_(oldChildC8n)) {
                            c8n.connect(oldChildC8n)
                          }
                          break
                        }
                      }
                    }
                  }
                }
                if (eYo.Selected.connection === childC8n || eYo.Selected.connection === parentC8n) {
                  eYo.Selected.connection = null
                }
                ch_eyo.setIncog(parentC8n.eyo.isIncog())
              }, () => { // finally
                if (parentC8n.eyo.startOfStatement) {
                  ch_eyo.incrementChangeCount()
                }
                eYo.Connection.connectedParentM4t = parentC8n.eyo
                // next must absolutely run because of possible undo management
                ch_eyo.didConnect(childC8n, oldParentC8n, oldChildC8n)
              })
            }, () => { // finally
              // next must absolutely run because of possible undo management
              p_eyo.didConnect(parentC8n, oldChildC8n, oldParentC8n)
            })
          }, () => { // finally
            if (!parentC8n.eyo.wrapped_) {
              parentC8n.eyo.bindField && parentC8n.eyo.bindField.setVisible(false)
              // next must absolutely run because of possible undo management
              parentC8n.eyo.didConnect(oldParentC8n, oldChildC8n)
            }
          })
        }, () => { // finally
          if (!childC8n.eyo.wrapped_) {
            childC8n.eyo.didConnect(oldChildC8n, oldParentC8n)
            eYo.Connection.connectedParentM4t = undefined
            childC8n.eyo.bindField && childC8n.eyo.bindField.setVisible(false) // unreachable ?
          }
        })
      }
    )
  }
}) ()

/**
 * Disconnect two blocks that are connected by this connection.
 * Add hooks to allow customization.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.disconnectInternal_ = (() => {
  // Closure
  var disconnectInternal_ = Blockly.RenderedConnection.prototype.disconnectInternal_

  return function (parent, child) {
    var block = this.getSourceBlock()
    if (block === parent) {
      var parentC8n = this
      var childC8n = this.targetConnection
    } else {
      parentC8n = this.targetConnection
      childC8n = this
    }
    child.eyo.changeWrap(
      () => { // `this` is catched
        var wrapper = parent.eyo // .wrapper
        wrapper.changeWrap( // the parent may be a wrapped block
          () => { // `this` is catched
            eYo.Do.tryFinally(() => {
              parentC8n.eyo.willDisconnect()
              eYo.Do.tryFinally(() => {
                childC8n.eyo.willDisconnect()
                eYo.Do.tryFinally(() => {
                  wrapper.willDisconnect(parentC8n)
                  eYo.Do.tryFinally(() => {
                    child.eyo.willDisconnect(childC8n)
                    eYo.Do.tryFinally(() => {
                      // the work starts here
                      if (parentC8n.eyo.wrapped_) {
                        // currently unwrapping a block,
                        // this occurs while removing the parent
                        // if the parent was selected, select the child
                        child.eyo.wrapped_ = false
                        if (parent.eyo.uiHasSelect) {
                          parent.unselect()
                          child.select()
                        }
                      }
                      disconnectInternal_.call(this, parent, child)
                      if (child.eyo.plugged_) {
                        child.eyo.plugged_ = undefined
                      }
                    }, () => { // finally
                      eYo.Connection.disconnectedParentM4t = parentC8n.eyo
                      eYo.Connection.disconnectedChildM4t = childC8n.eyo
                      eYo.Connection.disconnectedParentM4t = undefined
                      eYo.Connection.disconnectedChildM4t = undefined
                      parent.eyo.incrementInputChangeCount && parent.eyo.incrementInputChangeCount() // list are special
                      parentC8n.eyo.bindField && parentC8n.eyo.bindField.setVisible(true) // no wrapped test
                      childC8n.eyo.bindField && childC8n.eyo.bindField.setVisible(true) // unreachable ?
                    })
                  }, () => { // finally
                    child.eyo.didDisconnect(childC8n, parentC8n)
                  })
                }, () => { // finally
                  wrapper.didDisconnect(parentC8n, childC8n)
                })
              }, () => { // finally
                childC8n.eyo.didDisconnect(parentC8n)
              })
            }, () => { // finally
              parentC8n.eyo.unwrappedConnection.eyo.didDisconnect(childC8n)
            })
          }
        )
      }
    )
  }
}) ()

/**
 * Does the given block have one and only one connection point that will accept
 * an orphaned block?
 * Returns the first free connection that can accept the orphan
 *
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 * @override
 * @suppress {accessControls}
 */
Blockly.Connection.uniqueConnection_ = function (block, orphanBlock) {
  var output = orphanBlock && orphanBlock.eyo.magnets.output
  return output && block.eyo.someInputMagnet(m4t => {
    if (m4t.isInput && output.checkType_(m4t)) {
      if (!m4t.target) {
        return m4t.connection
      }
    }
  }) || null
}

/**
 * Set whether this connections is hidden (not tracked in a database) or not.
 * The delegate's hidden_ property takes precedence over `hidden`parameter.
 * There is a timeout sent by blockly to show connections.
 * In fact we bypass the real method if the connection is not epected to show.
 * @param {boolean} hidden True if connection is hidden.
 */
Blockly.RenderedConnection.prototype.setHidden = (() => {
  // this is a closure
  var setHidden = Blockly.RenderedConnection.prototype.setHidden
  return function (hidden) {
    // ADDED by JL:
    if (!hidden && this.eyo.incog_) {
      // Incog connections must stay hidden
      return
    }
    if (goog.isDef(this.eyo.hidden_)) {
      hidden = this.eyo.hidden_
    }
    // DONE
    setHidden.call(this, hidden)
  }
}) ()

/**
 * Change the connection's coordinates.
 * @param {goog.math.Coordinate} x New absolute x coordinate, in workspace coordinates.
 * @param {goog.math.Coordinate} y New absolute y coordinate, in workspace coordinates.
 * @suppress {accessControls}
 */
Blockly.RenderedConnection.prototype.moveTo = function (x, y) {
  // ADDED by JL: do nothing when the connection did not move
  if (this.x_ !== x || this.y_ !== y || (!x && !y)) {
    // Remove it from its old location in the database (if already present)
    if (this.inDB_) {
      this.db_.removeConnection_(this)
    }
    this.x_ = x
    this.y_ = y
    // Insert it into its new location in the database.
    if (!this.hidden_) {
      this.db_.addConnection(this)
    }
  }
}

/**
 * Find the closest compatible connection to this connection.
 * All parameters are in workspace units.
 * @param {goog.math.Coordinate} maxLimit The maximum radius to another connection.
 * @param {goog.math.Coordinate} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {goog.math.Coordinate} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
 *     properties: 'connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 * @suppress{accessControls}
 */
Blockly.RenderedConnection.prototype.closest = function (maxLimit, dxy, dy) {
  // BEGIN ADDENDUM by JL
  if (this.hidden_) {
    return {}
  }
  // END ADDENDUM by JL
  return this.dbOpposite_.searchForClosest(this, maxLimit, dxy)
}

/**
 * Returns the distance between this connection and another connection in
 * workspace units.
 * The computation takes into account the width of statement blocks.
 * @param {!Blockly.Connection} otherConnection The other connection to measure
 *     the distance to.
 * @return {number} The distance between connections, in workspace units.
 */
Blockly.RenderedConnection.prototype.distanceFrom = function(otherConnection) {
  var c8nA = this
  var c8nB = otherConnection
  var xDiff = c8nA.x_ - c8nB.x_
  var yDiff = c8nA.y_ - c8nB.y_
  if (c8nA.eyo.isInput) {
    yDiff += eYo.Padding.h
  } else if (c8nB.eyo.isInput) {
    yDiff -= eYo.Padding.h
  }
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Sever all links to this connection (not including from the source object).
 * @suppress{accessControls}
 */
Blockly.Connection.prototype.dispose = function () {
  // this is a closure
  var dispose = Blockly.Connection.prototype.dispose
  return function () {
    if (eYo.Selected.connection === this) {
      eYo.Selected.connection = null
    }
    dispose.call(this)
  }
} ()

/**
 * Function to be called when this connection's compatible types have changed.
 * @private
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function() {
  // The new value type may not be compatible with the existing connection.
  if (this.isConnected() && !this.checkType_(this.targetConnection)) {
    var child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
    child.unplug();
    // Bump away.
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * Function to be called when this connection's compatible types have changed.
 * @private
 * @suppress{accessControls}
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function () {
  // this is a closure
  /** @suppress{accessControls} */
  var onCheckChanged_ = Blockly.RenderedConnection.prototype.onCheckChanged_
  return function () {
    onCheckChanged_.call(this)
    this.sourceBlock_.eyo.incrementChangeCount()
    var target = this.targetBlock()
    if (target) {
      target.eyo.incrementChangeCount() // there was once a `consolidate(false, true)` here.
    }
  }
} ()

/**
 * Does the given block have one and only one connection point that will accept
 * an orphaned block?
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 * @suppress{accessControls}
 */
Blockly.Connection.singleConnection_ = function (block, orphanBlock) {
  var connection = null
  for (var i = 0; i < block.inputList.length; i++) {
    var c8n = block.inputList[i].connection
    if (c8n && c8n.eyo.isInput &&
        orphanBlock.outputConnection.checkType_(c8n) && !c8n.eyo.bindField) {
      if (connection) {
        return null // More than one connection.
      }
      connection = c8n
    }
  }
  return connection
}

/**
 * Walks down a row a blocks, at each stage checking if there are any
 * connections that will accept the orphaned block.  If at any point there
 * are zero or multiple eligible connections, returns null.  Otherwise
 * returns the only input on the last block in the chain.
 * Terminates early for shadow blocks.
 * @param {!Blockly.Block} startBlock The block on which to start the search.
 * @param {!Blockly.Block} orphanBlock The block that is looking for a home.
 * @return {Blockly.Connection} The suitable connection point on the chain
 *    of blocks, or null.
 * @suppress{accessControls}
 * @private
 */
Blockly.Connection.lastConnectionInRow_ = function (startBlock, orphanBlock) {
  var newBlock = startBlock
  var connection
  while ((connection = Blockly.Connection.singleConnection_(
    /** @type {!Blockly.Block} */ (newBlock), orphanBlock)) && !connection.eyo.incog_) {
    // '=' is intentional in line above.
    newBlock = connection.targetBlock()
    if (!newBlock || newBlock.isShadow()) {
      return connection
    }
  }
  return null
}

/**
 * Move the blocks on either side of this connection right next to each other.
 * Delegates the translate process to the block
 * @private
 */
Blockly.RenderedConnection.prototype.tighten_ = function() {
  var where = this.eyo.where
  var target_where = this.targetConnection.eyo.where
  var dc = target_where.c - where.c
  var dl = target_where.l - where.l
  if (dc != 0 || dl != 0) {
    var block = this.targetBlock();
    block.eyo.ui.setOffset(-dc, -dl);
  }
};
Blockly.RenderedConnection.prototype.tighten_ = function() {
  var dx = this.targetConnection.x_ - this.x_;
  var dy = this.targetConnection.y_ - this.y_;
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    block.eyo.ui.setOffset(-dx, -dy);
  }
};

/**
 * Returns the block that this connection connects to.
 * Creates the block when should wrapped.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
eYo.Connection.prototype.targetBlock = function() {
  var target = eYo.Connection.superClass_.targetBlock.call(this)
  if (!target && this.eyo.wrapped_) {
    this.eyo.completeWrap()
    target = eYo.Connection.superClass_.targetBlock.call(this)
  }
  return target
}

/**
 * Change a connection's compatibility.
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
Blockly.Connection.prototype.setCheck = function(check) {
  if (check) {
    // Ensure that check is in an array.
    if (!goog.isArray(check)) {
      check = [check];
    }
    this.check_ = check;
    this.onCheckChanged_();
  } else {
    this.check_ = null;
  }
  return this;
}

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
eYo.Connection.prototype.isSuperior = function() {
  return this.eyo.isSuperior
}
