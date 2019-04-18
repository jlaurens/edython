/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.Selected
 * @namespace
 */

goog.provide('eYo.Selected')

goog.require('eYo.Draw')

eYo.Selected = (() => {
  var me = {}
  var eyo__
  var block__
  var c8n__
  me.updateDraw = () => {
    if (eyo__ && eyo__.isReady) {
      eyo__.renderer.updateShape()
      eYo.Draw.addBlockSelect_(eyo__)
      eYo.Draw.addStatusSelect_(eyo__)
      if (c8n__) {
        eYo.Draw.addBlockConnection_(eyo__)
        eYo.Draw.removeBlockHilight_(eyo__)
      } else {
        eYo.Draw.addBlockHilight_(eyo__)
      }
    }
  }
  me.scrollToVisible = (force) => {
    if (eyo__ && (!eyo__.inVisibleArea() || force)) {
      eyo__.workspace.eyo.scrollBlockTopLeft(eyo__.id)
    }
  }  
  Object.defineProperties(
    me,
    {
      block_: {
        get () {
          return block__
        },
        set (newValue) {
          this.eyo_ = newValue && newValue.eyo
        }
      },
      eyo_: {
        get () {
          return eyo__
        },
        set (newValue) {
          if (newValue) {
            var wrapper = newValue.wrapper
            if (wrapper && newValue !== wrapper) {
              // Wrapped blocks should not be selected.
              this.eyo_ = wrapper // recursive call but not reentrant
              return
            }
          }
          if (eyo__ !== newValue) {
            if (eyo__) {
              // unselect/unhilight the previous block
              eYo.Draw.removeBlockSelect_(eyo__)
              eYo.Draw.removeBlockHilight_(eyo__)
              eYo.Draw.removeBlockConnection_(eyo__)
              eYo.Draw.removeStatusSelect_(eyo__)
              eyo__.selectedConnection = null
              eyo__.selectedConnectionSource_ = null
              eyo__ = block__ = null
            }
            if (newValue) {
              eyo__ = newValue
              block__ = eyo__.block_
              if (!eyo__.canEdit_) {
                // catch eyo__
                setTimeout((eyo => {
                  return () => {
                    eyo.canEdit_ = true
                  }
                })(eyo__), 10)
              }
              if (c8n__) {
                var b_eyo = c8n__.eyo.b_eyo
                if (b_eyo && newValue !== b_eyo.wrapper) {
                  c8n__ = null
                }
              }
              block__.bringToFront()
              this.didAdd()
            } else {
              c8n__ = null
              this.didRemove()
            }
          }
        }
      },
      connection_: {
        get () {
          return c8n__
        },
        set (c8n) {
          if (c8n !== c8n__) {
            if (c8n) {
              var c_eyo = c8n.eyo
              var b_eyo = c_eyo.b_eyo
              if (b_eyo) {
                var wrapper
                // if the connection visually belongs to 2 blocks, select the top left most
                if (c_eyo.isPrevious && c8n.targetConnection) {
                  wrapper = c_eyo.t_eyo.wrapper
                  c8n = c_eyo.target.connection
                } else {
                  wrapper = b_eyo.wrapper
                }
                if (wrapper && wrapper !== b_eyo) {
                  this.eyo_ = wrapper
                  eyo__.selectedConnection = c8n__
                  eyo__.selectedConnectionSource_ = b_eyo
                  c8n__ = c8n
                  return
                }
                c8n__ = c8n
                this.eyo_ = b_eyo
              }
            } else {
              if (eyo__) {
                eYo.Draw.removeBlockConnection_(eyo__)
                eyo__.selectedConnection = null
                eyo__.selectedConnectionSource_ = null
              }
              c8n__ = c8n
            }
          }
        }
      },
      block: {
        get () {
          return block__
        },
        set (newValue) {
          this.eyo = newValue && newValue.eyo
        }
      },
      eyo: {
        get () {
          return eyo__
        },
        set (newValue) {
          this.eyo_ = newValue
          this.connection = null
          this.updateDraw()
        }
      },
      connection: {
        get () {
          return c8n__
        },
        set (c8n) {
          if (c8n) {
            if (c8n.hidden_) {
              console.error('Do not select a hidden connection')
            }
            var c_eyo = c8n.eyo
            var b_eyo = c_eyo.b_eyo
            if (b_eyo) {
              if (b_eyo.locked_) {
                return
              }
              if (c_eyo.isInput) {
                // Do not select a connection with a target, select the target instead
                var t_eyo = c_eyo.t_eyo
                if (t_eyo) {
                  this.eyo =  t_eyo
                  return
                }
              }
            }
          }
          this.connection_ = c8n
          this.updateDraw()
        }
      }
    }
  )
  me.didAdd = eYo.Do.nothing
  me.didRemove = eYo.Do.nothing
  return me
})()

eYo.Selected.selectOneBlockOf = (blocks, force) => {
  var select
  var eyos = blocks.filter(block => block).map(block => block.eyo)
  var f = (eyo) => {
    if (eyo.isControl && eyo.suiteHeight) {
      select = eyo
      return true
    }
  }
  var g = (eyo) => {
    if (eyo.isControl) {
      select = eyo
      return true
    }
  }
  if (eyos.length && !eyos.some(f) && !eyos.some(g)) {
    select = eyos[0]
  }
  if (select) {
    eYo.Selected.eyo = select
    eYo.Selected.scrollToVisible(force)
  }
}

/**
 * Convenient property
 */
Object.defineProperties(
  Blockly,
  {
    selected: {
      get () {
        return eYo.Selected.block
      },
      set (newValue) {
        eYo.Selected.block = newValue
      }
    }
  }
)

/**
 * Select this block.  Highlight it visually.
 * Wrapped blocks are not selectable.
 */
eYo.BlockSvg.prototype.select = function () {
  this.eyo.select()
}

/**
 * Select this block.  Highlight it visually.
 * Wrapped blocks are not selectable.
 */
eYo.DelegateSvg.prototype.select = function () {
  if (!this.workspace) {
    return
  }
  eYo.Selected.eyo = this
}

/**
 * Unselect this block.
 * If there is a selected connection, it is removed.
 * Unselect is used from click handling methods.
 */
eYo.BlockSvg.prototype.unselect = function () {
  eYo.BlockSvg.superClass_.unselect.call(this)
  this.eyo.unselect()
}

/**
 * Unselect this block.
 * If there is a selected connection, it is removed.
 * Unselect is used from click handling methods.
 */
eYo.DelegateSvg.prototype.unselect = function () {
  if (eYo.Selected.eyo === this) {
    eYo.Selected.eyo = null
  }
}

/**
 * Forwards to the delegate.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
eYo.BlockSvg.prototype.onMouseDown_ = function (e) {
  this.eyo.onMouseDown_(e)
}

/**
 * Forwards to the delegate.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
eYo.BlockSvg.prototype.onMouseUp_ = function (e) {
  this.eyo.onMouseUp_(e)
}

/**
 * Get the input for the given event.
 * The block is already rendered once.
 *
 * For edython.
 * @param {Object} e in general a mouse down event
 * @return {Object|undefined|null}
 */
eYo.DelegateSvg.prototype.getConnectionForEvent = function (e) {
  var block = this.block_
  var ws = block.workspace
  if (!ws) {
    return
  }
  // if we clicked on a field, no connection returned
  var gesture = ws.getGesture(e)
  if (gesture && gesture.startField_) {
    return
  }
  var where = Blockly.utils.mouseToSvg(e, ws.getParentSvg(),
  ws.getInverseScreenCTM());
  where = goog.math.Coordinate.difference(where, ws.getOriginOffsetInPixels())
  where.scale(1 / ws.scale)
  var rect = this.getBoundingRect()
  where = goog.math.Coordinate.difference(where, rect.getTopLeft())
  var R
  var c8n = this.someInputConnection(c8n => {
    var c_eyo = c8n.eyo
    if (!c_eyo.disabled_ && (!c8n.hidden_ || c_eyo.wrapped_)) {
      if (c_eyo.isInput) {
        var target = c8n.targetBlock()
        if (target) {
          var targetC8n = target.eyo.getConnectionForEvent(e)
          if (targetC8n) {
            return targetC8n
          }
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x + eYo.Unit.x / 2,
            c8n.offsetInBlock_.y,
            target.width - eYo.Unit.x,
            target.height
          )
          if (R.contains(where)) {
            return c8n
          }
        }
        if (c_eyo.slot && c_eyo.slot.bindField) {
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x,
            c8n.offsetInBlock_.y + eYo.Padding.t,
            c_eyo.w * eYo.Unit.x,
            eYo.Font.height
          )
        } else if (c_eyo.optional_ || c_eyo.s7r_) {
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x - eYo.Unit.x / 4,
            c8n.offsetInBlock_.y + eYo.Padding.t,
            1.5 * eYo.Unit.x,
            eYo.Font.height
          )
        } else {
          R = new goog.math.Rect(
            c8n.offsetInBlock_.x + eYo.Unit.x / 4,
            c8n.offsetInBlock_.y + eYo.Padding.t,
            (c_eyo.w - 1 / 2) * eYo.Unit.x,
            eYo.Font.height
          )
        }
        if (R.contains(where)) {
          return c8n
        }
      } else if (c_eyo.isNextLike) {
        R = new goog.math.Rect(
          c8n.offsetInBlock_.x,
          c8n.offsetInBlock_.y - eYo.Style.Path.width,
          eYo.Font.tabWidth,
          1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
        )
        if (R.contains(where)) {
          return c8n
        }
      }
    }
  })
  if (c8n) {
    return c8n
  } else if ((c8n = block.previousConnection) && !c8n.hidden) {
    R = new goog.math.Rect(
      c8n.offsetInBlock_.x,
      c8n.offsetInBlock_.y - 2 * eYo.Style.Path.width,
      rect.width,
      1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
    )
    if (R.contains(where)) {
      return c8n
    }
  }
  if ((c8n = this.nextConnection) && !c8n.hidden) {
    if (rect.height > eYo.Font.lineHeight) { // Not the cleanest design
      R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        eYo.Font.tabWidth + eYo.Style.Path.r, // R U sure?
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    } else {
      R = new goog.math.Rect(
        c8n.offsetInBlock_.x,
        c8n.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        rect.width,
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    }
    if (R.contains(where)) {
      return c8n
    }
  }
  if ((c8n = this.suiteConnection) && !c8n.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new goog.math.Rect(
      c8n.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      c8n.offsetInBlock_.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return c8n
    }
  }
  if ((c8n = this.leftStmtConnection) && !c8n.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new goog.math.Rect(
      c8n.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      c8n.offsetInBlock_.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return c8n
    }
  }
  if ((c8n = this.rightStmtConnection) && !c8n.hidden) {
    R = new goog.math.Rect(
      c8n.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      c8n.offsetInBlock_.y + r,
      2 * r,
      eYo.Font.lineHeight - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return c8n
    }
  }
}

/**
 * Handle a mouse-down on an SVG block.
 * If the block is sealed to its parent, forwards to the parent.
 * This is used to prevent a dragging operation on a sealed block.
 * However, this will manage the selection of an input connection.
 * onMouseDown_ message is sent multiple times for one mouse click
 * because blocks may lay on above the other (when connected for example)
 * Considering the selection of a connection, we manage the onMouseDown_ calls
 * independantly. Whatever node is answering to a mousDown event,
 * a connection will be activated if relevant.
 * There is a problem due to the shape of the blocks.
 * Depending on the block, the coutour path ou the whole svg group
 * is better suited to listed to mouse events.
 * Actually, both are registered which implies that
 * handlers must filter out reentrancy.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
eYo.DelegateSvg.prototype.onMouseDown_ = function (e) {
  if (this.locked_) {
    var parent = this.parent
    if (parent) {
      return
    }
  }
  if (this.renderer.parentIsShort && eYo.Selected.eyo !== this) {
    parent = this.parent
    if (eYo.Selected.eyo !== parent) {
      eYo.BlockSvg.superClass_.onMouseDown_.call(parent.block_, e)
      return
    }
  }
  // unfortunately, the mouse events sometimes do not find there way to the proper block
  var c8n = this.getConnectionForEvent(e)
  var c_eyo = c8n && c8n.eyo
  var target = c_eyo
  ? c_eyo.isInput
    ? c_eyo.t_eyo || c_eyo.b_eyo
    : c_eyo.b_eyo
  : this
  while (target && (target.wrapped_ || target.locked_)) {
    target = target.parent
  }
  // console.log('MOUSE DOWN', target)
  // Next trick because of the the dual event binding
  // reentrant management
  if (!target || target.alreadyMouseDownEvent_ === e) {
    return
  }
  target.alreadyMouseDownEvent_ = e
  // Next is not good design
  // remove any selected connection, if any
  // but remember it for a contextual menu
  target.lastSelectedConnection = eYo.Selected.connection
  target.selectedConnectionSource_ = null
  // Prepare the mouseUp event for an eventual connection selection
  target.lastMouseDownEvent = target === eYo.Selected.eyo ? e : null
  eYo.BlockSvg.superClass_.onMouseDown_.call(target.block_, e)
}

/**
 * The selected connection is used to insert blocks with the keyboard.
 * When a connection is selected, one of the ancestor blocks is also selected.
 * Then, the higlighted path of the source blocks is not the outline of the block
 * but the shape of the connection as it shows when blocks are moved close enough.
 */
eYo.DelegateSvg.prototype.onMouseUp_ = function (e) {
  const c8n = this.getConnectionForEvent(e)
  const c_eyo = c8n && c8n.eyo
  var target = c_eyo
  ? c_eyo.isInput
    ? c_eyo.t_eyo || c_eyo.b_eyo
    : c_eyo.b_eyo
  : this
  while (target && (target.wrapped_ || target.locked_)) {
    target = target.parent
  }
  // reentrancy filter
  if (!target || target.alreadyMouseUpEvent_ === e) {
    return
  }
  target.alreadyMouseUpEvent_ = e
  var ee = target.lastMouseDownEvent
  if (ee) {
    // a block was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      if (target === eYo.Selected.eyo) {
        // the block was already selected,
        if (c8n) {
          // and there is a candidate selection
          if (eYo.Selected.connection === c8n) {
            // unselect
            eYo.Selected.connection = null
          } else if (c8n !== target.lastSelectedConnection) {
            if (c_eyo.isInput) {
              if (!c_eyo.t_eyo) {
                var field = c_eyo.bindField
                field && (field.eyo.doNotEdit = true)
                eYo.Selected.connection = c8n
              }
            } else {
              eYo.Selected.connection = c8n
            }
          } else {
            eYo.Selected.connection = null
          }
        } else if (eYo.Selected.connection) {
          eYo.Selected.connection = null
        } else if (target.selectMouseDownEvent) {
          eYo.Selected.eyo = (this.isStmt ? this : this.stmtParent) || target.root
          target.selectMouseDownEvent = null
        }
      }
    }
  } else if (eYo.Selected.eyo && (ee = eYo.Selected.eyo.selectMouseDownEvent)) {
    eYo.Selected.eyo.selectMouseDownEvent = null
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      // select the block which is an ancestor of the target
      // which parent is the selected block
      var parent = target
      while ((parent = parent.parent)) {
        console.log('ancestor', parent.type)
        if ((parent === eYo.Selected.eyo)) {
          eYo.Selected.eyo = target
          break
        } else if (!parent.wrapped_) {
          target = parent
        }
      }
    }
  }
  eYo.App.didTouchBlock && eYo.App.didTouchBlock(eYo.Selected.block)
}
