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

goog.require('eYo.BlockSvg')
goog.require('eYo.Magnet')
goog.require('eYo.Do')

eYo.Selected = (() => {
  var me = {}
  var eyo__
  var c8n__
  me.updateDraw = () => {
    if (eyo__ && eyo__.isReady) {
      eyo__.ui.updateShape()
      eyo__.ui.addBlockSelect_()
      eyo__.ui.addStatusSelect_()
      if (c8n__) {
        eyo__.ui.addBlockConnection_()
        eyo__.ui.removeBlockHilight_()
      } else {
        eyo__.ui.addBlockHilight_()
      }
    }
  }
  me.scrollToVisible = (force) => {
    eyo__ && eyo__.scrollToVisible(force)
  }
  Object.defineProperties(
    me,
    {
      dlgt: {
        get () {
          return eyo__
        },
        set (newValue) {
          this.eyo = newValue
        }
      },
      magnet: {
        get () {
          return c8n__ && c8n__.eyo
        },
        set (newValue) {
          me.connection = newValue && newValue.connection
        }
      },
      block: {
        get () {
          return eyo__.block_
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
              eyo__.ui.removeBlockSelect_()
              eyo__.ui.removeBlockHilight_()
              eyo__.ui.removeBlockConnection_()
              eyo__.ui.removeStatusSelect_()
              eyo__.selectedConnection = null
              eyo__.selectedMagnetDlgt_ = null
              eyo__ = null
            }
            if (newValue) {
              eyo__ = newValue
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
              eyo__.ui.sendToFront()
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
              var m4t = c8n.eyo
              var b_eyo = m4t.b_eyo
              if (b_eyo) {
                var wrapper
                // if the connection visually belongs to 2 blocks, select the top left most
                if (m4t.isHead && m4t.target) {
                  wrapper = m4t.t_eyo.wrapper
                  c8n = m4t.target.connection
                } else {
                  wrapper = b_eyo.wrapper
                }
                if (wrapper && wrapper !== b_eyo) {
                  this.eyo_ = wrapper
                  eyo__.selectedConnection = c8n__
                  eyo__.selectedMagnetDlgt_ = b_eyo
                  c8n__ = c8n
                  return
                }
                c8n__ = c8n
                this.eyo_ = b_eyo
              }
            } else {
              if (eyo__) {
                eyo__.ui.removeBlockConnection_()
                eyo__.selectedConnection = null
                eyo__.selectedMagnetDlgt_ = null
              }
              c8n__ = c8n
            }
          }
        }
      },
      block: {
        get () {
          return eyo__.block_
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
  Object.defineProperty(eYo.Delegate.prototype, 'selected', {
    get() {
      return this === eyo__
    }
  })
  Object.defineProperty(eYo.Magnet.prototype, 'selected', {
    get() {
      return this.connection === c8n__
    }
  })
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
 * Select this magnet. Highlight it visually.
 * Wrapped magnets are not selectable.
 * @return {eYo.Magnet} this
 */
eYo.Magnet.prototype.select = function () {
  eYo.Selected.magnet = this
  return this
}

/**
 * Unselect this magnet.
 * If `this` is the selected magnet, it looses its status.
 * Unselect is used from click handling methods.
 */
eYo.Delegate.prototype.unselect = function () {
  if (this.selected) {
    eYo.Selected.magnet = null
  }
}

/**
 * Select this block.  Highlight it visually.
 * Wrapped blocks are not selectable.
 */
eYo.Delegate.prototype.select = eYo.Decorate.reentrant_method('select', function () {
  return !this.workspace
    ? this
    : (eYo.Selected.dlgt = this)
})

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
  if (this.workspace && this.selected) {
    eYo.Selected.dlgt = null
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
eYo.DelegateSvg.prototype.getMagnetForEvent = function (e) {
  var ws = this.workspace
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
  var m4t = this.someInputMagnet(m4t => {
    if (!m4t.disabled_ && (!m4t.hidden_ || m4t.wrapped_)) {
      if (m4t.isInput) {
        var target = m4t.target
        if (target) {
          var targetM4t = target.b_eyo.getMagnetForEvent(e)
          if (targetM4t) {
            return targetM4t
          }
          R = new goog.math.Rect(
            m4t.offsetInBlock_.x + eYo.Unit.x / 2,
            m4t.offsetInBlock_.y,
            target.width - eYo.Unit.x,
            target.height
          )
          if (R.contains(where)) {
            return m4t
          }
        }
        if (m4t.slot && m4t.slot.bindField) {
          R = new goog.math.Rect(
            m4t.offsetInBlock_.x,
            m4t.offsetInBlock_.y + eYo.Padding.t,
            m4t.w * eYo.Unit.x,
            eYo.Font.height
          )
        } else if (m4t.optional_ || m4t.s7r_) {
          R = new goog.math.Rect(
            m4t.offsetInBlock_.x - eYo.Unit.x / 4,
            m4t.offsetInBlock_.y + eYo.Padding.t,
            1.5 * eYo.Unit.x,
            eYo.Font.height
          )
        } else {
          R = new goog.math.Rect(
            m4t.offsetInBlock_.x + eYo.Unit.x / 4,
            m4t.offsetInBlock_.y + eYo.Padding.t,
            (m4t.w - 1 / 2) * eYo.Unit.x,
            eYo.Font.height
          )
        }
        if (R.contains(where)) {
          return m4t
        }
      } else if (m4t.isFoot || m4t.isSuite) {
        R = new goog.math.Rect(
          m4t.offsetInBlock_.x,
          m4t.offsetInBlock_.y - eYo.Style.Path.width,
          eYo.Font.tabWidth,
          1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
        )
        if (R.contains(where)) {
          return m4t
        }
      }
    }
  })
  if (m4t) {
    return m4t
  } else if ((m4t = this.magnets.head) && !m4t.hidden) {
    R = new goog.math.Rect(
      m4t.offsetInBlock_.x,
      m4t.offsetInBlock_.y - 2 * eYo.Style.Path.width,
      rect.width,
      1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
    )
    if (R.contains(where)) {
      return m4t
    }
  }
  if ((m4t = this.magnets.foot) && !m4t.hidden) {
    if (rect.height > eYo.Font.lineHeight) { // Not the cleanest design
      R = new goog.math.Rect(
        m4t.offsetInBlock_.x,
        m4t.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        eYo.Font.tabWidth + eYo.Style.Path.r, // R U sure?
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    } else {
      R = new goog.math.Rect(
        m4t.offsetInBlock_.x,
        m4t.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        rect.width,
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    }
    if (R.contains(where)) {
      return m4t
    }
  }
  if ((m4t = this.magnets.suite) && !m4t.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new goog.math.Rect(
      m4t.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      m4t.offsetInBlock_.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return m4t
    }
  }
  if ((m4t = this.magnets.left) && !m4t.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new goog.math.Rect(
      m4t.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      m4t.offsetInBlock_.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return m4t
    }
  }
  if ((m4t = this.magnets.right) && !m4t.hidden) {
    R = new goog.math.Rect(
      m4t.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      m4t.offsetInBlock_.y + r,
      2 * r,
      eYo.Font.lineHeight - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return m4t
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
  if (this.ui.parentIsShort && eYo.Selected.eyo !== this) {
    parent = this.parent
    if (eYo.Selected.eyo !== parent) {
      eYo.BlockSvg.superClass_.onMouseDown_.call(parent.block_, e)
      return
    }
  }
  // unfortunately, the mouse events sometimes do not find there way to the proper block
  var m4t = this.getMagnetForEvent(e)
  var t_eyo = m4t
  ? m4t.isInput
    ? m4t.t_eyo || m4t.b_eyo
    : m4t.b_eyo
  : this
  while (t_eyo && (t_eyo.wrapped_ || t_eyo.locked_)) {
    t_eyo = t_eyo.parent
  }
  // console.log('MOUSE DOWN', target)
  // Next trick because of the the dual event binding
  // reentrant management
  if (!t_eyo || t_eyo.alreadyMouseDownEvent_ === e) {
    return
  }
  t_eyo.alreadyMouseDownEvent_ = e
  // Next is not good design
  // remove any selected connection, if any
  // but remember it for a contextual menu
  t_eyo.lastSelectedMagnet = eYo.Selected.magnet
  t_eyo.selectedMagnetDlgt_ = null
  // Prepare the mouseUp event for an eventual connection selection
  t_eyo.lastMouseDownEvent = t_eyo === eYo.Selected.eyo ? e : null
  eYo.BlockSvg.superClass_.onMouseDown_.call(t_eyo.block_, e)
}

/**
 * The selected connection is used to insert blocks with the keyboard.
 * When a connection is selected, one of the ancestor blocks is also selected.
 * Then, the higlighted path of the source blocks is not the outline of the block
 * but the shape of the connection as it shows when blocks are moved close enough.
 */
eYo.DelegateSvg.prototype.onMouseUp_ = function (e) {
  const m4t = this.getMagnetForEvent(e)
  var t_eyo = m4t
  ? m4t.isInput
    ? m4t.t_eyo || m4t.b_eyo
    : m4t.b_eyo
  : this
  while (t_eyo && (t_eyo.wrapped_ || t_eyo.locked_)) {
    t_eyo = t_eyo.parent
  }
  // reentrancy filter
  if (!t_eyo || t_eyo.alreadyMouseUpEvent_ === e) {
    return
  }
  t_eyo.alreadyMouseUpEvent_ = e
  var ee = t_eyo.lastMouseDownEvent
  if (ee) {
    // a block was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      if (t_eyo === eYo.Selected.eyo) {
        // the block was already selected,
        if (m4t) {
          // and there is a candidate selection
          if (eYo.Selected.magnet === m4t) {
            // unselect
            eYo.Selected.magnet = null
          } else if (m4t !== t_eyo.lastSelectedMagnet) {
            if (m4t.isInput) {
              if (!m4t.t_eyo) {
                var field = m4t.bindField
                field && (field.eyo.doNotEdit = true)
                m4t.select()
              }
            } else {
              m4t.select()
            }
          } else {
            eYo.Selected.magnet = null
          }
        } else if (eYo.Selected.magnet) {
          eYo.Selected.magnet = null
        } else if (t_eyo.selectMouseDownEvent) {
          eYo.Selected.eyo = (this.isStmt ? this : this.stmtParent) || t_eyo.root
          t_eyo.selectMouseDownEvent = null
        }
      }
    }
  } else if (eYo.Selected.eyo && (ee = eYo.Selected.eyo.selectMouseDownEvent)) {
    eYo.Selected.eyo.selectMouseDownEvent = null
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      // select the block which is an ancestor of the target
      // which parent is the selected block
      var parent = t_eyo
      while ((parent = parent.parent)) {
        console.log('ancestor', parent.type)
        if ((parent === eYo.Selected.eyo)) {
          eYo.Selected.eyo = t_eyo
          break
        } else if (!parent.wrapped_) {
          t_eyo = parent
        }
      }
    }
  }
  eYo.App.didTouchBlock && eYo.App.didTouchBlock(eYo.Selected.block)
}
