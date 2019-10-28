/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Focus utilities for edython.
 * Each board has a focus manager, which remembers the object with focus,
 * either a brick, a magnet or a field.
 * The main focus manager belongs to the workspace owning all the boards.
 * It takes care of remembering which board has the focus.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.Focus
 * @namespace
 **/

goog.provide('eYo.Focus')
goog.require('eYo')

goog.require('eYo.Do')

goog.require('eYo.Board')
goog.require('eYo.Brick')
goog.require('eYo.Magnet')
goog.require('eYo.Field')

goog.forwardDeclare('eYo.Workspace')

goog.forwardDeclare('goog.math')

eYo.Focus = Object.create(null)

/**
 * The main focus manager.
 * @param {!eYo.Workspace} workspace,  the owning workspace.
 * @constructor
 */
eYo.Focus.Main = function (workspace) {
  this.workspace_ = workspace
  /**
   * The various focus managers associate to each board of the workspace.
   * @type{Array<eYo.Focus.Mgr>}
   */
  this.mgrs_ = []
}

Object.defineProperties(eYo.Focus.Main.prototype, {
  /**
   * The manager that has current focus
   * @type {?eYo.Focus.Mgr}
  * @private
    */
  mgr_: {
    value: null
  },
  /**
   * The manager that has current focus
   * @type {?eYo.Focus.Mgr}
   */
  mgr: {
    get () {
      return this.mgr_
    }
  },
  /**
   * The board that has current focus, if any
   * @type {?eYo.Board}
   * @private
   */
  board_: {
    value: null
  },
  /**
   * The board that has current focus, if any
   * @type {?eYo.Board}
   */
  board: {
    get () {
      return this.mgr_ && this.mgr_.board
    },
    set (newValue) {
      if (newValue && this.mgr_ && newValue !== this.mgr_.board) {
        this.mgr_ = newValue.focusMgr
      }
    }
  },
  /**
   * The brick that has current focus, if any
   * @type {?eYo.Brick}
   */
  brick: {
    get () {
      return this.mgr_ && this.mgr_.brick
    },
    set (newValue) {
      if (newValue && this.mgr_ && newValue !== this.mgr_.brick) {
        this.mgr_ = newValue.focusMgr
        this.mgr_.brick = newValue
      }
    }
  },
  /**
   * The field that has current focus, if any
   * @type {?eYo.Field}
   */
  field: {
    get () {
      return this.mgr_ && this.mgr_.field
    },
    set (newValue) {
      if (newValue && this.mgr_ && newValue !== this.mgr_.field) {
        this.mgr_ = newValue.focusMgr
        this.mgr_.field = newValue
      }
    }
  },
  /**
   * The magnet that has current focus, if any
   * @type {?eYo.Magnet}
   */
  magnet: {
    get () {
      return this.mgr_ && this.mgr_.magnet
    },
    set (newValue) {
      if (newValue && this.mgr_ && newValue !== this.mgr_.magnet) {
        this.mgr_ = newValue.focusMgr
        this.mgr_.magnet = newValue
      }
    }
  },
})

/**
 * Sever all the links including the focus managers.
 */
eYo.Focus.Main.prototype.dispose = function () {
  this.mgr_ = null
  this.mgrs_.foreach(mgr => mgr.dispose())
  this.mgrs_.length = 0
  this.mgrs_ = null
  this.workspace_ = null
}

/**
 * Update visible state of the focused object.
 */
eYo.Focus.Main.prototype.updateDraw = function () {
  this.mgrs_.foreach(m => m.updateDraw())
}

/**
 * Create a focus manager.
 * @param {!eYo.Board} board,  the owner of the focus object.
 * @param {!eYo.Focus.Main} main,  The main focus manager.
 * @constructor
 */
eYo.Focus.Mgr = function (board, main) {
  this.board_ = board
  this.main_ = main
  main.mgrs_.push(this)
}

/**
 * Sever all the links and let the main focus manager gorget the receiver.
 */
eYo.Focus.Mgr.prototype.dispose = function () {
  var m = this.main_
  m.mgrs_ = m.mgrs_.filter(m => m !== this)
  if (m.mgr_ === this) {
    m.mgr_ = null
  }
  this.main_ = null
  this.board_ = null
}

Object.defineProperties(eYo.Focus.Mgr.prototype, {
  /**
   * The focused brick
   */
  brick__: {
    value: null
  },
  magnet__: {
    value: null
  },
  field__: {
    value: null
  },
  /**
   * @type{eYo.Brick}
   */
  brick: {
    get () {
      return this.brick__
    },
    set (newValue) {
      if (newValue && !newValue.board) return
      this.magnet_ = null
      this.field_ = null
      this.brick_ = newValue
      this.updateDraw()
    }
  },
  /**
   * Manages the brick's wrapper.
   * @type{eYo.Brick}
   * @private
   */
  brick_: {
    get () {
      return this.brick__
    },
    set (brick) {
      if (brick) {
        var wrapper = brick.wrapper
        if (wrapper && brick !== wrapper) {
          // Wrapped bricks should not be selected.
          this.brick_ = wrapper // recursive call but not reentrant
          return
        }
      }
      if (this.brick__ !== brick) {
        if (this.brick__) {
          // unselect/unhilight the previous brick
          var ui = this.brick__.ui
          // This seems a bit complicated
          ui.removeFocus()
          ui.removeBrickHilight_()
          ui.removeMagnet_()
          ui.removeStatusFocus_()
          this.brick__ = null
        }
        if (brick) {
          this.brick__ = brick
          if (this.magnet__) {
            var b3k = this.magnet__.brick
            if (b3k && brick !== b3k.wrapper) {
              this.magnet_ = null
            }
          }
          this.brick__.ui.sendToFront()
          this.didAdd()
        } else {
          this.magnet_ = null
          this.didRemove()
        }
      }
    }
  },
  /**
   * Takes care of consistency between the magnet and the brick.
   * @type{eYo.Magnet}
   * @private
   */
  magnet_: {
    get () {
      return magnet__
    },
    set (magnet) {
      if (magnet !== this.magnet__) {
        if (magnet) {
          var b3k = magnet.brick
          if (b3k !== this.brick__) {
            // if the connection visually belongs to 2 bricks, select the top left most
            if (magnet.isHead && magnet.target) {
              var wrapper = magnet.targetBrick.wrapper
              magnet = magnet.target
            } else {
              wrapper = b3k.wrapper
            }
            if (wrapper && wrapper !== b3k) {
              this.brick_ = wrapper
              this.magnet__ = magnet
              return
            }
            this.magnet__ = magnet
            this.brick_ = b3k
          }
        } else {
          if (this.brick__) {
            this.brick__.ui.removeMagnet_()
          }
          this.magnet__ = magnet
        }
      }
    }
  },
  /**
   * Takes care of consistency between the magnet and the brick.
   * @type{eYo.Magnet}
   */
  magnet: {
    get () {
      return magnet__
    },
    set (magnet) {
      if (magnet !== this.magnet__) {
        this.field_ = null
        if (magnet) {
          if (!magnet.board) return
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
        this.magnet__ = magnet
        this.updateDraw()
      }
    }
  },
  /**
   * Takes care of consistency between the field and the brick.
   * @type{eYo.Field}
   * @private
   */
  field_: {
    get () {
      return field__
    },
    set (field) {
      if (field !== this.field__) {
        this.magnet_ = null
        if (field) {
          var b3k = field.brick
          if (b3k !== this.brick__) {
            this.field__ = field
            this.brick_ = b3k
          }
        } else {
          if (this.brick__) {
            this.brick__.ui.removeMagnet_()
          }
          this.field__ = field
        }
      }
    }
  },
})

/**
 * Update visible state of the focused object.
 */
eYo.Focus.Mgr.prototype.updateDraw = function () {
  if (this.brick_ && this.brick_.hasUI) {
    var ui = this.brick_.ui
    ui.updateShape()
    ui.addSelect()
    ui.addStatusSelect_()
    if (magnet__) {
      ui.addMagnet_()
      ui.removeBrickHilight_()
    } else {
      ui.addBrickHilight_()
    }
  }
}

eYo.Focus.Mgr.prototype.scrollToVisible = function (force) {
  this.brick_ && (this.brick_.scrollToVisible(force))
}

/**
 * Hook.
 */
eYo.Focus.Mgr.prototype.didAdd = eYo.Do.nothing

/**
 * Hook.
 */
eYo.Focus.Mgr.prototype.didRemove = eYo.Do.nothing

/**
 * Select one of the given bricks.
 * @param {Array<eYo.Bricks>} bricks
 * @param {Boolean} force
 */
eYo.Focus.Mgr.prototype.selectOneBrickOf = function (bricks, force) {
  var select
  bricks = [].concat(bricks)
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
  if (select && select.focus()) {
    select.scrollToVisible(force)
  }
}

Object.defineProperties(eYo.Brick.prototype, {
  focusMgr_: {
    get () {
      return this.board_.focusMgr_
    }
  },
  focusMain_: {
    get () {
      this.board_.workspace_.focusMgr_
    }
  },
  hasFocus: {
    get() {
      return this === this.focusMgr_.brick__
    },
    set (newValue) {
      newValue ? this.focus() : this.unfocus()
    }
  },
})

Object.defineProperties(eYo.Magnet.prototype, {
  focusMgr_: {
    get () {
      return this.board_.focusMgr_
    }
  },
  focusMain_: {
    get () {
      this.board_.workspace_.focusMgr_
    }
  },
  hasFocus: {
    get() {
      return this === this.focusMgr_.magnet__
    },
    set (newValue) {
      newValue ? this.focus() : this.unfocus()
    }
  },
})

Object.defineProperties(eYo.Field.prototype, {
  focusMgr_: {
    get () {
      return this.board_.focusMgr_
    }
  },
  focusMain_: {
    get () {
      return this.board_.workspace_.focusMgr_
    }
  },
  hasFocus: {
    get() {
      return this === this.focusMgr_.field__
    },
    set (newValue) {
      newValue ? this.focus() : this.unfocus()
    }
  },
})

/**
 * Select this brick.  Highlight it visually.
 * Wrapped bricks are not selectable.
 * @param {Boolean} noBoard,  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Brick.prototype.focus = function (noBoard) {
  !noBoard && (this.focusMain_.board = this.board)
  return !!(this.focusMgr_.brick = this)
}

/**
 * Select this field. Highlight it visually.
 * @param {Boolean} noBoard,  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Field.prototype.focus = function (noBoard) {
  !noBoard && (this.focusMain_.board = this.board)
  return !!(eYo.Focus.field = this)
}

/**
 * Select this magnet. Highlight it visually.
 * Wrapped magnets are not selectable.
 * @param {Boolean} noBoard,  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Magnet.prototype.focus = function (noBoard) {
  !noBoard && (this.focusMain_.board = this.board)
  return !!(eYo.Focus.magnet = this)
}

/**
 * Unfocus this brick.
 * If there is a selected connection, it is removed.
 * Unfocus is used from click handling methods.
 */
eYo.Brick.prototype.unfocus = function () {
  this.hasFocus && (this.focusMgr_.brick = null)
}

/**
 * Unfocus this magnet.
 * If `this` is the selected magnet, it looses its status.
 * Unfocus is used from click handling methods.
 * Does nothing if the receiver is not selected.
 */
eYo.Magnet.prototype.unfocus = function () {
  this.hasFocus && (this.focusMgr_.magnet = null)
}

/**
 * Unfocus this field.
 * Unfocus is used from click handling methods.
 */
eYo.Field.prototype.unfocus = function () {
  this.hasFocus && (this.focusMgr_.field = null)
}
