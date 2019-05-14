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

goog.require('eYo.Magnet')
goog.require('eYo.Do')

goog.require('goog.math')

eYo.Selected = (() => {
  var me = {}
  var brick__
  var magnet__
  me.updateDraw = () => {
    if (brick__ && brick__.isReady) {
      brick__.ui.updateShape()
      brick__.ui.addDlgtSelect_()
      brick__.ui.addStatusSelect_()
      if (magnet__) {
        brick__.ui.addBlockMagnet_()
        brick__.ui.removeBlockHilight_()
      } else {
        brick__.ui.addBlockHilight_()
      }
    }
  }
  me.scrollToVisible = (force) => {
    brick__ && brick__.scrollToVisible(force)
  }
  Object.defineProperties(
    me,
    {
      brick: {
        get () {
          return brick__
        },
        set (newValue) {
          if (newValue && !newValue.workspace) return
          this.brick_ = newValue
          this.magnet_ = null
          this.updateDraw()
        }
      },
      brick_: {
        get () {
          return brick__
        },
        set (newValue) {
          if (newValue) {
            var wrapper = newValue.wrapper
            if (wrapper && newValue !== wrapper) {
              // Wrapped bricks should not be selected.
              this.brick_ = wrapper // recursive call but not reentrant
              return
            }
          }
          if (brick__ !== newValue) {
            if (brick__) {
              // unselect/unhilight the previous brick
              brick__.ui.brickRemoveSelect_()
              brick__.ui.removeBlockHilight_()
              brick__.ui.brickRemoveMagnet_()
              brick__.ui.removeStatusSelect_()
              brick__.selectedMagnet = null
              brick__ = null
            }
            if (newValue) {
              brick__ = newValue
              if (!brick__.canEdit_) {
                // Why timeout
                setTimeout(() => {brick__.canEdit_ = true}, 10)
              }
              if (magnet__) {
                var brick = magnet__.brick
                if (brick && newValue !== brick.wrapper) {
                  magnet__ = null
                }
              }
              brick__.ui.sendToFront()
              this.didAdd()
            } else {
              magnet__ = null
              this.didRemove()
            }
          }
        }
      },
      magnet_: {
        get () {
          return magnet__
        },
        set (magnet) {
          if (magnet !== magnet__) {
            if (magnet) {
              var brick = magnet.brick
              if (brick) {
                // if the connection visually belongs to 2 bricks, select the top left most
                if (magnet.isHead && magnet.target) {
                  var wrapper = magnet.targetBrick.wrapper
                  magnet = magnet.target
                } else {
                  wrapper = brick.wrapper
                }
                if (wrapper && wrapper !== brick) {
                  this.brick_ = wrapper
                  brick__.selectedMagnet = magnet__
                  magnet__ = magnet
                  return
                }
                magnet__ = magnet
                this.brick_ = brick
              }
            } else {
              if (brick__) {
                brick__.ui.brickRemoveMagnet_()
                brick__.selectedMagnet = null
              }
              magnet__ = magnet
            }
          }
        }
      },
      magnet: {
        get () {
          return magnet__
        },
        set (magnet) {
          if (magnet) {
            if (!magnet.workspace) return
            if (magnet.hidden_) {
              console.error('Do not select a hidden connection')
            }
            var brick = magnet.brick
            if (brick) {
              if (brick.locked_) {
                return
              }
              if (magnet.isInput) {
                // Do not select a connection with a target, select the target instead
                var t_brick = magnet.targetBrick
                if (t_brick) {
                  this.eyo =  t_brick
                  return
                }
              }
            }
          }
          this.magnet_ = magnet
          this.updateDraw()
        }
      }
    }
  )
  me.didAdd = eYo.Do.nothing
  me.didRemove = eYo.Do.nothing
  Object.defineProperty(eYo.Brick.prototype, 'selected', {
    get() {
      return this === brick__
    }
  })
  Object.defineProperty(eYo.Magnet.prototype, 'selected', {
    get() {
      return this === magnet__
    }
  })
  return me
})()

eYo.Selected.selectOneBlockOf = (bricks, force) => {
  var select
  var eyos = bricks.filter(brick => brick).map(brick => brick.eyo)
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
    eYo.Selected.brick = select
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
        return eYo.Selected.brick
      },
      set (newValue) {
        eYo.Selected.brick = newValue
      }
    }
  }
)

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
eYo.Magnet.prototype.unselect = function () {
  if (this.selected) {
    eYo.Selected.magnet = null
  }
}

/**
 * Select this brick.  Highlight it visually.
 * Wrapped bricks are not selectable.
 */
eYo.Brick.prototype.select = eYo.Decorate.reentrant_method('select', function () {
  return (eYo.Selected.brick = this)
})

/**
 * Unselect this brick.
 * If there is a selected connection, it is removed.
 * Unselect is used from click handling methods.
 */
eYo.Brick.prototype.unselect = function () {
  if (this.workspace && this.selected) {
    eYo.Selected.brick = null
  }
}

/**
 * Get the input for the given event.
 * The brick is already rendered once.
 *
 * For edython.
 * @param {Object} e in general a mouse down event
 * @return {Object|undefined|null}
 */
eYo.Brick.prototype.getMagnetForEvent = function (e) {
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
  var rect = this.boundingRect
  where = goog.math.Coordinate.difference(where, rect.getTopLeft())
  var R
  var magnet = this.someInputMagnet(magnet => {
    if (!magnet.disabled_ && (!magnet.hidden_ || magnet.wrapped_)) {
      if (magnet.isInput) {
        var target = magnet.target
        if (target) {
          var targetM4t = target.brick.getMagnetForEvent(e)
          if (targetM4t) {
            return targetM4t
          }
          R = new goog.math.Rect(
            magnet.offsetInBlock_.x + eYo.Unit.x / 2,
            magnet.offsetInBlock_.y,
            target.width - eYo.Unit.x,
            target.height
          )
          if (R.contains(where)) {
            return magnet
          }
        }
        if (magnet.slot && magnet.slot.bindField) {
          R = new goog.math.Rect(
            magnet.offsetInBlock_.x,
            magnet.offsetInBlock_.y + eYo.Padding.t,
            magnet.w * eYo.Unit.x,
            eYo.Font.height
          )
        } else if (magnet.optional_ || magnet.s7r_) {
          R = new goog.math.Rect(
            magnet.offsetInBlock_.x - eYo.Unit.x / 4,
            magnet.offsetInBlock_.y + eYo.Padding.t,
            1.5 * eYo.Unit.x,
            eYo.Font.height
          )
        } else {
          R = new goog.math.Rect(
            magnet.offsetInBlock_.x + eYo.Unit.x / 4,
            magnet.offsetInBlock_.y + eYo.Padding.t,
            (magnet.w - 1 / 2) * eYo.Unit.x,
            eYo.Font.height
          )
        }
        if (R.contains(where)) {
          return magnet
        }
      } else if (magnet.isFoot || magnet.isSuite) {
        R = new goog.math.Rect(
          magnet.offsetInBlock_.x,
          magnet.offsetInBlock_.y - eYo.Style.Path.width,
          eYo.Font.tabWidth,
          1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
        )
        if (R.contains(where)) {
          return magnet
        }
      }
    }
  })
  if (magnet) {
    return magnet
  } else if ((magnet = this.magnets.head) && !magnet.hidden) {
    R = new goog.math.Rect(
      magnet.offsetInBlock_.x,
      magnet.offsetInBlock_.y - 2 * eYo.Style.Path.width,
      rect.width,
      1.5 * eYo.Padding.t + 2 * eYo.Style.Path.width
    )
    if (R.contains(where)) {
      return magnet
    }
  }
  if ((magnet = this.magnets.foot) && !magnet.hidden) {
    if (rect.height > eYo.Font.lineHeight) { // Not the cleanest design
      R = new goog.math.Rect(
        magnet.offsetInBlock_.x,
        magnet.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        eYo.Font.tabWidth + eYo.Style.Path.r, // R U sure?
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    } else {
      R = new goog.math.Rect(
        magnet.offsetInBlock_.x,
        magnet.offsetInBlock_.y - 1.5 * eYo.Padding.b - eYo.Style.Path.width,
        rect.width,
        1.5 * eYo.Padding.b + 2 * eYo.Style.Path.width
      )
    }
    if (R.contains(where)) {
      return magnet
    }
  }
  if ((magnet = this.magnets.suite) && !magnet.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new goog.math.Rect(
      magnet.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      magnet.offsetInBlock_.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return magnet
    }
  }
  if ((magnet = this.magnets.left) && !magnet.hidden) {
    var r = eYo.Style.Path.Hilighted.width
    R = new goog.math.Rect(
      magnet.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      magnet.offsetInBlock_.y + r,
      2 * r,
      eYo.Unit.y - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return magnet
    }
  }
  if ((magnet = this.magnets.right) && !magnet.hidden) {
    R = new goog.math.Rect(
      magnet.offsetInBlock_.x + eYo.Unit.x / 2 - r,
      magnet.offsetInBlock_.y + r,
      2 * r,
      eYo.Font.lineHeight - 2 * r // R U sure?
    )
    if (R.contains(where)) {
      return magnet
    }
  }
}

/**
 * Handle a mouse-down on an SVG brick.
 * If the brick is sealed to its parent, forwards to the parent.
 * This is used to prevent a dragging operation on a sealed brick.
 * However, this will manage the selection of an input connection.
 * onMouseDown_ message is sent multiple times for one mouse click
 * because bricks may lay on above the other (when connected for example)
 * Considering the selection of a connection, we manage the onMouseDown_ calls
 * independantly. Whatever node is answering to a mousDown event,
 * a connection will be activated if relevant.
 * There is a problem due to the shape of the bricks.
 * Depending on the brick, the coutour path ou the whole svg group
 * is better suited to listed to mouse events.
 * Actually, both are registered which implies that
 * handlers must filter out reentrancy.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
eYo.Brick.prototype.onMouseDown_ = function (e) {
  if (this.locked_) {
    var parent = this.parent
    if (parent) {
      return
    }
  }
  if (this.ui.parentIsShort && !this.selected) {
    parent = this.parent
    if (!parent.selected) {
      var gesture = this.workspace.getGesture(e);
      if (gesture) {
        gesture.handleBlockStart(e, this)
      }    
      return
    }
  }
  // unfortunately, the mouse events sometimes do not find there way to the proper brick
  var magnet = this.getMagnetForEvent(e)
  var t_brick = magnet
  ? magnet.isInput
    ? magnet.targetBrick || magnet.brick
    : magnet.brick
  : this
  while (t_brick && (t_brick.wrapped_ || t_brick.locked_)) {
    t_brick = t_brick.parent
  }
  // console.log('MOUSE DOWN', target)
  // Next trick because of the the dual event binding
  // reentrant management
  if (!t_brick || t_brick.alreadyMouseDownEvent_ === e) {
    return
  }
  t_brick.alreadyMouseDownEvent_ = e
  // Next is not good design
  // remove any selected connection, if any
  // but remember it for a contextual menu
  t_brick.lastSelectedMagnet = eYo.Selected.magnet
  // Prepare the mouseUp event for an eventual connection selection
  t_brick.lastMouseDownEvent = t_brick.selected ? e : null
  var gesture = this.workspace.getGesture(e);
  if (gesture) {
    gesture.handleBlockStart(e, t_brick)
  }
}

/**
 * The selected connection is used to insert bricks with the keyboard.
 * When a connection is selected, one of the ancestor bricks is also selected.
 * Then, the higlighted path of the source bricks is not the outline of the brick
 * but the shape of the connection as it shows when bricks are moved close enough.
 */
eYo.Brick.prototype.onMouseUp_ = function (e) {
  const magnet = this.getMagnetForEvent(e)
  var t_brick = magnet
  ? magnet.isInput
    ? magnet.targetBrick || magnet.brick
    : magnet.brick
  : this
  while (t_brick && (t_brick.wrapped_ || t_brick.locked_)) {
    t_brick = t_brick.parent
  }
  // reentrancy filter
  if (!t_brick || t_brick.alreadyMouseUpEvent_ === e) {
    return
  }
  t_brick.alreadyMouseUpEvent_ = e
  var ee = t_brick.lastMouseDownEvent
  if (ee) {
    // a brick was selected when the mouse down event was sent
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      if (t_brick.selected) {
        // the brick was already selected,
        if (magnet) {
          // and there is a candidate selection
          if (magnet.selected) {
            // unselect
            eYo.Selected.magnet = null
          } else if (magnet !== t_brick.lastSelectedMagnet) {
            if (magnet.isInput) {
              if (!magnet.targetBrick) {
                var field = magnet.bindField
                field && (field.eyo.doNotEdit = true)
                magnet.select()
              }
            } else {
              magnet.select()
            }
          } else {
            eYo.Selected.magnet = null
          }
        } else if (eYo.Selected.magnet) {
          eYo.Selected.magnet = null
        } else if (t_brick.selectMouseDownEvent) {
          eYo.Selected.brick = (this.isStmt ? this : this.stmtParent) || t_brick.root
          t_brick.selectMouseDownEvent = null
        }
      }
    }
  } else if (eYo.Selected.brick && (ee = eYo.Selected.brick.selectMouseDownEvent)) {
    eYo.Selected.brick.selectMouseDownEvent = null
    if (ee.clientX === e.clientX && ee.clientY === e.clientY) {
      // not a drag move
      // select the brick which is an ancestor of the target
      // which parent is the selected brick
      var parent = t_brick
      while ((parent = parent.parent)) {
        console.log('ancestor', parent.type)
        if ((parent.selected)) {
          eYo.Selected.brick = t_brick
          break
        } else if (!parent.wrapped_) {
          t_brick = parent
        }
      }
    }
  }
  eYo.App.didTouchBlock && eYo.App.didTouchBlock(eYo.Selected.brick)
}
