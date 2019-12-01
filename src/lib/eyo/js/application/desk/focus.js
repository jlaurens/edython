/*
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Focus utilities for edython.
 * Each board has a focus manager, which remembers the object with focus,
 * either a brick, a magnet or a field.
 * The main focus manager belongs to the desk owning all the boards.
 * It takes care of remembering which board has the focus.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.Focus
 * @namespace
 **/

goog.require('eYo.Decorate')
goog.require('eYo.Owned')

goog.require('eYo.Do')
goog.require('eYo.Board')

goog.require('eYo.Brick')
goog.require('eYo.Magnet')
goog.require('eYo.Field')

goog.provide('eYo.Focus')

goog.forwardDeclare('eYo.Desk')
goog.forwardDeclare('goog.math')

/**
 * @name{eYo.Focus}
 * @namespace
 */

eYo.Focus = Object.create(null)

/**
 * The main focus manager.
 * @param {!eYo.Desk} desk,  the owning desk.
 * @constructor
 */
eYo.Focus.Main = function (desk) {
  eYo.Focus.Main.superClass_.constructor.call(this, desk)
  /**
   * The various focus managers associate to each board of the desk.
   * @type{Array<eYo.Focus.Mgr>}
   */
  this.mgrs_ = []
  this.disposeUI = eYo.Do.nothing
  this.hasUI && this.initUI()
}
goog.inherits(eYo.Focus.Main, eYo.Owned)

Object.defineProperties(eYo.Focus.Main.prototype, {
  /**
   * The desk of the receiver.
   * @type {eYo.Desk}
   * @readonly
   */
  desk: {
    get () {
      return this.owner_
    },
  },
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
    set (board) {
      if (board && this.mgr_ && board !== this.mgr_.board) {
        this.hasUI && this.ui_driver_mgr.offBoard(this)
        this.mgr_ = board.focusMgr
        this.hasUI && this.ui_driver_mgr.onBoard(this)
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
  this.disposeUI()
  this.mgr_ = null
  this.mgrs_.foreach(mgr => mgr.dispose())
  this.mgrs_.length = 0
  this.mgrs_ = null
  eYo.Focus.Main.superClass_.dispose.call(this)
}

/**
 * Make the UI. Called by the owner.
 */
eYo.Focus.Main.prototype.initUI = function() {
  delete this.disposeUI
  this.initUI = eYo.Do.nothing
  this.ui_driver_mgr.mainInitUI(this)
  this.mgrs_.foreach(m => m.initUI())
}

/**
 * Dispose the UI related resources.
 */
eYo.Focus.Main.prototype.disposeUI = function() {
  this.mgrs_.foreach(m => m.disposeUI())
  this.ui_driver_mgr.mainDisposeUI(this)
  delete this.initUI
  this.disposeUI = eYo.Do.nothing
}

/**
 * Create a standard focus manager, managed by a main focus manager.
 * @param {!eYo.Board} board,  the owner of the focus object.
 * @param {!eYo.Focus.Main} main,  The main focus manager.
 * @constructor
 */
eYo.Focus.Mgr = function (board, main) {
  eYo.Focus.Mgr.superClass_.constructor.call(this, board)
  this.main_ = main
  main.mgrs_.push(this)
  this.disposeUI = eYo.Do.nothing
  this.hasUI && this.initUI()
}
goog.inherits(eYo.Focus.Mgr, eYo.Owned)

/**
 * Sever all the links and let the main focus manager forget the receiver.
 */
eYo.Focus.Mgr.prototype.dispose = function () {
  this.disposeUI()
  var m = this.main_
  m.mgrs_ = m.mgrs_.filter(m => m !== this)
  if (m.mgr_ === this) {
    m.mgr_ = null
  }
  this.main_ = null
  eYo.Focus.Mgr.superClass_.dispose.call(this)
}

/**
 * Make the UI. Called by the owner.
 */
eYo.Focus.Mgr.prototype.initUI = function() {
  this.ui_driver_mgr.mgrInitUI(this)
  delete this.disposeUI
  this.initUI = eYo.Do.nothing
}

/**
 * Dispose the UI related resources.
 */
eYo.Focus.Mgr.prototype.disposeUI = function() {
  this.ui_driver_mgr.mgrDisposeUI(this)
  delete this.initUI
  this.disposeUI = eYo.Do.nothing
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
          this.hasUI && this.ui_driver_mgr.brickOff(this)
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
          this.hasUI && this.ui_driver_mgr.brickOn(this)
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
        this.hasUI && this.ui_driver_mgr.magnetOff(this)
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
          this.magnet__ = magnet
        }
        this.hasUI && this.ui_driver_mgr.magnetOn(this)
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
            if (magnet.isSlot) {
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
      }
    }
  },
  /**
   * Takes care of consistency between the field and the brick.
   * @type{eYo.Field}
   * @private
   */
  field: {
    get () {
      return this.field__
    },
    set (field) {
      this.field_ = field
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
        this.hasUI && this.ui_driver_mgr.fieldOff(this)
        this.magnet_ = null
        if (field) {
          var b3k = field.brick
          if (b3k !== this.brick__) {
            this.field__ = field
            this.brick_ = b3k
          }
        } else {
          this.field__ = field
        }
        this.hasUI && this.ui_driver_mgr.fieldOn(this)
      }
    }
  },
})

/**
 * Scroll the focused brick to visible.
 * UI related.
 */
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
  bricks = bricks.slice()
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
  if (select && select.focusOn()) {
    select.scrollToVisible(force)
  }
}

Object.defineProperties(eYo.Brick.Dflt.prototype, {
  focusMgr_: {
    get () {
      return this.board_.focusMgr_
    }
  },
  focusMain_: {
    get () {
      this.board_.owner_.focusMgr_
    }
  },
  hasFocus: {
    get() {
      return this === this.focusMgr_.brick__
    },
    set (newValue) {
      newValue ? this.focusOn() : this.focusOff()
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
      this.board_.owner_.focusMgr_
    }
  },
  hasFocus: {
    get() {
      return this === this.focusMgr_.magnet__
    },
    set (newValue) {
      newValue ? this.focusOn() : this.focusOff()
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
      return this.board_.owner_.focusMgr_
    }
  },
  hasFocus: {
    get() {
      return this === this.focusMgr_.field__
    },
    set (newValue) {
      newValue ? this.focusOn() : this.focusOff()
    }
  },
})

/**
 * Focus on this board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Board.prototype.focusOn = function () {
  return !!(this.focusMain_.board = this)
}

/**
 * Select this brick.  Highlight it visually.
 * Wrapped bricks are not selectable.
 * @param {Boolean} noBoard,  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Brick.Dflt.prototype.focusOn = function (noBoard) {
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
eYo.Field.prototype.focusOn = function (noBoard) {
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
eYo.Magnet.prototype.focusOn = function (noBoard) {
  !noBoard && (this.focusMain_.board = this.board)
  return !!(eYo.Focus.magnet = this)
}

/**
 * Focus off this board.
 */
eYo.Board.prototype.focusOff = function () {
  this.focusMain_.board = null
}

/**
 * Focus off this brick.
 * If there is a selected connection, it is removed.
 * `focusOff` is used from click handling methods.
 */
eYo.Brick.Dflt.prototype.focusOff = function () {
  this.hasFocus && (this.focusMgr_.brick = null)
}

/**
 * Focus off this magnet.
 * If `this` is the selected magnet, it looses its status.
 * `focusOff` is used from click handling methods.
 * Does nothing if the receiver is not selected.
 */
eYo.Magnet.prototype.focusOff = function () {
  this.hasFocus && (this.focusMgr_.magnet = null)
}

/**
 * Focus off this field.
 * `focusOff` is used from click handling methods.
 */
eYo.Field.prototype.focusOff = function () {
  this.hasFocus && (this.focusMgr_.field = null)
}
