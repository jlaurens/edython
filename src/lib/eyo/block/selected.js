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
  var eyo_
  var block_
  var c8n_
  Object.defineProperties(
    me,
    {
      block: {
        get () {
          return block_
        },
        set (newValue) {
          this.eyo = newValue && newValue.eyo
        }
      },
      eyo: {
        get () {
          return eyo_
        },
        set (newValue) {
          this.connection = null
          if (eyo_ !== newValue) {
            if (eyo_) {
              // unselect/unhilight the previous block
              eYo.Draw.removeBlockSelect_(eyo_)
              eYo.Draw.removeBlockHilight_(eyo_)
              eYo.Draw.removeStatusSelect_(eyo_)
              this.connection = null
              eyo_ = block_ = null
            }
            if (newValue) {
              if (newValue.wrapped_) {
                var parent = newValue.wrapper
                // Wrapped blocks should not be selected.
                if(parent) {
                  this.eyo = parent
                  return
                }
              }
              eyo_ = newValue
              block_ = eyo_.block_
              eYo.Draw.addBlockSelect_(eyo_)
              eYo.Draw.addBlockHilight_(eyo_)
              eYo.Draw.addStatusSelect_(eyo_)
              if (!eyo_.canEdit_) {
                setTimeout(() => {
                  eyo_.canEdit_ = true
                }, 10)
              }
              block_.bringToFront()
            } else {
              block_
            }
          }
        }
      },
      connection: {
        get () {
          return c8n_
        },
        set (c8n) {
          if (c8n) {
            if (c8n.hidden_) {
              console.error('Do not select a hidden connection')
            }
            var b_eyo = c8n.eyo.b_eyo
            if (b_eyo) {
              if (b_eyo.locked_) {
                return
              }
              if (c8n === b_eyo.previousConnection && c8n.targetConnection) {
                var wrapper = c8n.eyo.t_eyo.wrapper
                wrapper && (this.eyo = wrapper)
              }
            }
          }
          if (c8n !== c8n_) {
            if (c8n_) {
              eYo.Draw.removeBlockConnection_(eyo_)
              eyo_.selectedConnection = null
              eyo_.selectedConnectionSource_ = null
              c8n_ = null
            }
            if (c8n) {
              var c_eyo = c8n.eyo
              var b_eyo = c_eyo.b_eyo
              if (b_eyo) {
                // Do not select a connection with a target, select the target instead
                var t_eyo = c_eyo.t_eyo
                if (t_eyo) {
                  eYo.Selected.eyo =  t_eyo
                  return
                }
                wrapper = b_eyo.wrapper
                if (wrapper === eyo_) {
                  wrapper.selectedConnection = c8n_ = c8n
                  wrapper.selectedConnectionSource_ = b_eyo
                  wrapper.updateAllPaths_()
                  eYo.Draw.addBlockConnection_(wrapper)
                  eYo.Draw.addBlockSelect_(eyo_)
                  eYo.Draw.removeBlockHilight_(eyo_)
                } else if (wrapper) {
                  this.eyo = wrapper
                }
              }
            } else if (eyo_) {
              eYo.Draw.addBlockHilight_(eyo_)
            }
          }
        }
      }
    }
  )
  return me
})()

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
 * Whether the block is selected.
 * Subclassers will override this but won't call it.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.hasSelect = function () {
  return eYo.Draw.hasSelect(this)
}

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
  this.canEdit_ = false
  var eyo = this.selectedConnectionSource_
  if (eyo) {
    eyo.removeSelect()
    eyo.selectedConnection = null
    eyo.selectedConnectionSource_ = null
  }
  this.removeSelect()
  if (this.wrapped_) {
    var parent = this.wrapper
    parent && parent.unselect()
  }
}

/**
 * Select this block.  Highlight it visually.
 * If there is a selected connection, this connection will be highlighted.
 * If the block is wrapped, the first parent which is not wrapped will be
 * selected.
 * The Blockly method has been completely replaced.
 */
eYo.BlockSvg.prototype.addSelect = function () {
  this.eyo.addSelect()
}

/**
 * Select this block.  Highlight it visually.
 * If there is a selected connection, this connection will be highlighted.
 * The Blockly method has been completely replaced.
 * The svg group has as `eyo-select` class,
 * a path is added to show either the block shape or the selection.
 */
eYo.DelegateSvg.prototype.addSelect = function () {
  var g = this.svgGroup_
  if (this.selectedConnection && this.selectedConnection === eYo.Selected.connection) {
    // guard or rentrant
    if (!this.svgPathConnection_ || this.svgPathConnection_.parentNode) {
      return
    }
    g.appendChild(this.svgPathConnection_)
  } else if (!this.wrapped_) {
    var hasSelectedConnection = this.selectedConnectionSource_ && this.selectedConnectionSource_.selectedConnection
    if (hasSelectedConnection) {
      eYo.Draw.removeBlockSelect_(this)
      eYo.Draw.removeBlockHilight_(this)
    }
    if (this.svgPathSelect_.parentNode && hasSelectedConnection) {
      goog.dom.removeNode(this.svgPathSelect_)
      goog.dom.removeNode(this.svgPathHilight_)
    } else if (!this.svgPathSelect_.parentNode && !hasSelectedConnection) {
      g.appendChild(this.svgPathHilight_)
      g.appendChild(this.svgPathSelect_)
    }
  }
  eYo.Draw.addStatusSelect_(this)
  eYo.App.didAddSelect && eYo.App.didAddSelect(this.block_)
}

/**
 * Unselect this block.  Remove its highlighting.
 */
eYo.BlockSvg.prototype.removeSelect = function () {
  this.eyo.removeSelect()
}

/**
 * Unselect this block.  Remove its highlighting.
 */
eYo.DelegateSvg.prototype.removeSelect = function () {
  if (this.wrapped_) {
    if (!this.svgPathConnection_ || !this.svgPathConnection_.parentNode) {
      return
    }
  } else {
    if ((!this.svgPathSelect_ || !this.svgPathSelect_.parentNode) &&
      (!this.svgPathConnection_ || !this.svgPathConnection_.parentNode)) {
      if (this.svgGroup_) { // how come that we must test that?
        goog.dom.classlist.remove(this.svgGroup_, 'eyo-select')
      }
      if (this.svgContourGroup_) { // how come that we must test that? because some beReady message was not sent to the correct target
        goog.dom.classlist.remove(this.svgContourGroup_, 'eyo-select')
      }
      return
    }
  }
  if (this.svgPathSelect_ && this.svgPathSelect_.parentNode) {
    goog.dom.removeNode(this.svgPathHilight_)
    goog.dom.removeNode(this.svgPathSelect_)
  }
  if (this.svgPathConnection_ && this.svgPathConnection_.parentNode) {
    goog.dom.removeNode(this.svgPathConnection_)
  }
  var eyo
  if (!this.selectedConnection || ((eyo = eYo.Selected.eyo) && eyo.selectedConnectionSource_ !== this)) {
    goog.dom.removeNode(this.svgPathConnection_)
  }
  eYo.Draw.removeStatusSelect_(this)
  eYo.App.didRemoveSelect && eYo.App.didRemoveSelect(this.block_)
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
  var where = Blockly.utils.mouseToSvg(e, block.workspace.getParentSvg(),
  block.workspace.getInverseScreenCTM());
  where = goog.math.Coordinate.difference(where, block.workspace.getOriginOffsetInPixels())
  where.scale(1 / block.workspace.scale)
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
  if (this.parentIsShort && eYo.Selected.eyo !== this) {
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
      if (target === eYo.Selected.eyo && c8n) {
        // the block was already selected,
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
      }
    }
  }
  eYo.App.didTouchBlock && eYo.App.didTouchBlock(eYo.Selected.block)
}
