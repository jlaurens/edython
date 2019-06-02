/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
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

goog.require('eYo')

goog.require('eYo.Brick')
goog.require('eYo.Magnet')
goog.require('eYo.Do')

goog.forwardDeclare('goog.math')

eYo.Selected = (() => {
  var me = {}
  var brick__
  var magnet__
  me.updateDraw = () => {
    if (brick__ && brick__.hasUI) {
      brick__.ui.updateShape()
      brick__.ui.addSelect()
      brick__.ui.addStatusSelect_()
      if (magnet__) {
        brick__.ui.addMagnet_()
        brick__.ui.removeBrickHilight_()
      } else {
        brick__.ui.addBrickHilight_()
      }
    }
  }
  me.scrollToVisible = (force) => {
    brick__ && (brick__.scrollToVisible(force))
  }
  Object.defineProperties(
    me,
    {
      brick: {
        get () {
          return brick__
        },
        set (newValue) {
          if (newValue && !newValue.desk) return
          if (!newValue) {
            console.error('BREAK HERE')
          }
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
              brick__.ui.removeSelect()
              brick__.ui.removeBrickHilight_()
              brick__.ui.removeMagnet_()
              brick__.ui.removeStatusSelect_()
              brick__.selectedMagnet = null
              brick__ = null
            }
            if (newValue) {
              brick__ = newValue
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
                brick__.ui.removeMagnet_()
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
            if (!magnet.desk) return
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
                var t9k = magnet.targetBrick
                if (t9k) {
                  this.brick =  t9k
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
  Object.defineProperty(eYo.Magnet.prototype, 'isSelected', {
    get() {
      return this === magnet__
    },
    set (newValue) {
      newValue ? this.select() : this.unselect()
    }
  })
  Object.defineProperty(eYo.Brick.prototype, 'isSelected', {
    get() {
      return this === brick__
    },
    set (newValue) {
      newValue ? this.select() : this.unselect()
    }
  })
  return me
})()

eYo.Selected.selectOneBrickOf = (bricks, force) => {
  var select
  bricks = bricks.filter(brick => brick)
  var f = brick => {
    if (brick.isControl && brick.span.suite) {
      select = brick
      return true
    }
  }
  var g = brick => {
    if (brick.isControl) {
      select = brick
      return true
    }
  }
  if (bricks.length && !bricks.some(f) && !bricks.some(g)) {
    select = bricks[0]
  }
  if (select) {
    select.select().scrollToVisible(force)
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
        newValue.select()
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
  return (eYo.Selected.magnet = this)
}

/**
 * Unselect this magnet.
 * If `this` is the selected magnet, it looses its status.
 * Unselect is used from click handling methods.
 * Does nothing if the receiver is not selected.
 */
eYo.Magnet.prototype.unselect = function () {
  (this === eYo.Selected.magnet) && (eYo.Selected.magnet = null)
}

/**
 * Select this brick.  Highlight it visually.
 * Wrapped bricks are not selectable.
 */
eYo.Brick.prototype.select = eYo.Decorate.reentrant_method('select', function () {
  return (eYo.Selected.brick = this)
}, true)

/**
 * Unselect this brick.
 * If there is a selected connection, it is removed.
 * Unselect is used from click handling methods.
 */
eYo.Brick.prototype.unselect = function () {
  if (this.desk && this.isSelected) {
    eYo.Selected.brick = null
  }
}
