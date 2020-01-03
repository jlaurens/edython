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

eYo.require('Decorate')
eYo.require('C9r.Owned')

eYo.require('Do')
eYo.require('Board')

eYo.require('Brick')
eYo.require('Magnet')
eYo.require('Field')

/**
 * @name{eYo.Focus}
 * @namespace
 */
eYo.provide('Focus')

eYo.forwardDeclare('Desk')
goog.forwardDeclare('goog.math')


/**
 * The main focus manager is uniquely owned by the desk.
 * It maintains a list of focus managers associated to boards.
 * @param {eYo.Desk} desk -  the owning desk.
 * @constructor
 */
eYo.Focus.makeClass('Main', eYo.C9r.Owned, {
  computed: {
    /**
     * The desk of the receiver.
     * @type {eYo.Desk}
     * @readonly
     */
    desk () {
      return this.owner
    },
    /**
     * The board that has current focus, if any
     * @type {eYo.Board}
     */
    board: {
      get () {
        return this.mngr && this.mngr.board
      },
      set (board) {
        if (board !== this.board) {
          this.hasUI && this.ui_driver.offBoard(this)
          this.mngr_ = board && board.focusMngr
          this.hasUI && this.ui_driver.onBoard(this)
        }
      }
    },
    /**
     * The brick that has current focus, if any
     * @type {?eYo.Brick}
     */
    brick: {
      get () {
        return this.mngr_ && this.mngr_.brick
      },
      set (after) {
        if (after && this.mngr_ && after !== this.mngr_.brick) {
          this.mngr_ = after.focusMngr
          this.mngr_.brick = after
        }
      }
    },
    /**
     * The field that has current focus, if any
     * @type {?eYo.Field}
     */
    field: {
      get () {
        return this.mngr_ && this.mngr_.field
      },
      set (after) {
        if (after && this.mngr_ && after !== this.mngr_.field) {
          this.mngr_ = after.focusMngr
          this.mngr_.field = after
        }
      }
    },
    /**
     * The magnet that has current focus, if any
     * @type {!eYo.Magnet.Dflt}
     */
    magnet: {
      get () {
        return this.mngr_ && this.mngr_.magnet
      },
      set (after) {
        if (after && this.mngr_ && after !== this.mngr_.magnet) {
          this.mngr_ = after.focusMngr
          this.mngr_.magnet = after
        }
      }
    },
  },
  valued: {
    /**
     * The manager that has current focus
     * @type {?eYo.Focus.Mngr}
     */
    mngr: eYo.NA,
    /**
     * The manager that may have the current focus
     * @type {?Array<eYo.Focus.Mngr>}
     */
    mngrs: [],
  },
  ui: {
    init () {
      this.mngrs_.forEach(m => m.initUI())
    },
    dispose () {
      this.mngrs_.foreach(m => m.disposeUI())
    },
  }
})

/**
 * Create a standard focus manager, managed by a main focus manager.
 * @param {eYo.Board} board -  the owner of the focus object.
 * @param {eYo.Focus.Main} main -  The main focus manager.
 * @constructor
 */
eYo.Focus.makeClass('Mngr', eYo.C9r.Owned, {
  init () {
    this.main.mngrs.push(this)
  },
  computed: {
    /**
     * The owning board.
     * @type {eYo.Board.Dflt}
     */
    board () {
      return this.owner__
    },
    main () {
      return this.board.desk.focus
    },
  },
  dispose () {
    var m = this.main_
    m.mngrs_ = m.mngrs_.filter(m => m !== this)
    if (m.mngr_ === this) {
      m.mngr_ = null
    }
    this.main_ = null
  },
})

Object.defineProperties(eYo.Focus.Mngr.prototype, {
  /**
   * @type{eYo.Brick}
   */
  brick: {
    validate (after) {
      if (after) {
        var wrapper = after.wrapper
        if (wrapper) {
          return wrapper
        }
      }
      return after
    },
    willChange() {
      this.hasUI && this.ui_driver.brickOff(this)
    },
    didChange(after) {
      if (after) {
        if (this.magnet__) {
          var b3k = this.magnet__.brick
          if (b3k && after !== b3k.wrapper) {
            this.magnet_ = null
          }
        }
        if (this.field__) {
          var b3k = this.field__.brick
          if (b3k && after !== b3k.wrapper) {
            this.field__ = null
          }
        }
        this.hasUI && this.ui_driver_mngr.brickOn(this)
        this.didAdd()
      } else {
        this.magnet_ = null
        this.field_ = null
        this.didRemove()
      }
    },
  },
  /**
   * Takes care of consistency between the magnet and the brick.
   * @type{eYo.Magnet.Dflt}
   * @private
   */
  magnet_: {
    get () {
      return magnet__
    },
    set (magnet) {
      if (magnet !== this.magnet__) {
        this.hasUI && this.ui_driver_mngr.magnetOff(this)
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
        this.hasUI && this.ui_driver_mngr.magnetOn(this)
      }
    }
  },
  /**
   * Takes care of consistency between the magnet and the brick.
   * @type{eYo.Magnet.Dflt}
   */
  magnet: {
    get () {
      return magnet__
    },
    validate(after) {
      if (after) {
        if (!after.board) return eYo.INVALID
        if (after.hidden_) {
          console.error('Do not select a hidden connection')
          return eYo.INVALID
        }
        var b3k = after.brick
        if (b3k) {
          if (b3k.locked_) {
            return eYo.INVALID
          }
          if (after.isSlot) {
            // Do not select a connection with a target, select the target instead
            var t9k = after.targetBrick
            if (t9k) {
              this.brick_ =  t9k
              return eYo.INVALID
            }
          }
        }
        return after
      }
    },
    willChange() {
      this.field_ = null
    },
  },
  /**
   * Takes care of consistency between the field and the brick.
   * @type{eYo.Field}
   * @private
   */
  field: {
    get () {
      return field__
    },
    willChange (after) {
      this.ui_driver.fieldOff(this)
      this.magnet_ = null
      if (after) {
        var b3k = after.brick
        if (b3k !== this.brick) {
          this.brick_ = eYo.NA
        }
      }
    },
    didChange (after) {
      if (after) {
        if (!this.brick) {
          this.brick_ = after.brick
        }
        this.ui_driver.fieldOn(this)
      }
    },
  },
})

/**
 * Scroll the focused brick to visible.
 * UI related.
 */
eYo.Focus.Mngr.prototype.scrollToVisible = function (force) {
  this.brick && this.brick.scrollToVisible(force)
}

/**
 * Hook.
 */
eYo.Focus.Mngr.prototype.didAdd = eYo.Do.nothing

/**
 * Hook.
 */
eYo.Focus.Mngr.prototype.didRemove = eYo.Do.nothing

/**
 * Select one of the given bricks.
 * @param {Array<eYo.BrickNSs>} bricks
 * @param {Boolean} force
 */
eYo.Focus.Mngr.prototype.selectOneBrickOf = function (bricks, force) {
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


eYo.Brick.Dflt.eyo.modelDeclare({
  computed: {
    focusMngr () {
      return this.board.focusMngr
    },
    focusMain () {
      this.board.focusMain
    },
    hasFocus: {
      get() {
        return this === this.focusMngr.brick
      },
      set (after) {
        after ? this.focusOn() : this.focusOff()
      }
    },
  }
})

eYo.Magnet.Dflt.eyo.modelDeclare({
  computed: {
    focusMngr () {
      return this.board.focusMngr
    },
    focusMain () {
      this.board.focusMain
    },
    hasFocus: {
      get() {
        return this === this.focusMngr.magnet
      },
      set (after) {
        after ? this.focusOn() : this.focusOff()
      }
    },
  },
})

eYo.Field.Dflt.eyo.modelDeclare({
  computed: {
    focusMngr () {
      return this.board.focusMngr
    },
    focusMain () {
      return this.board.focusMain
    },
    hasFocus: {
      get() {
        return this === this.focusMngr.field
      },
      set (after) {
        after ? this.focusOn() : this.focusOff()
      },
    },
  }
})

/**
 * Focus on this board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Board.Dflt_p.focusOn = function () {
  return !!(this.focusMain.board = this)
}

/**
 * Select this brick.  Highlight it visually.
 * Wrapped bricks are not selectable.
 * @param {Boolean} noBoard -  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Brick.Dflt_p.focusOn = function (noBoard) {
  noBoard || this.board.focusOn()
  return !!(this.focusMngr.brick = this)
}

/**
 * Select this field. Highlight it visually.
 * @param {Boolean} noBoard -  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Field.Dflt_p.focusOn = function (noBoard) {
  noBoard || this.board.focusOn()
  return !!(this.focusMngr.field = this)
}

/**
 * Select this magnet. Highlight it visually.
 * Wrapped magnets are not selectable.
 * @param {Boolean} noBoard -  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.Magnet.Dflt_p.focusOn = function (noBoard) {
  noBoard || this.board.focusOn()
  return !!(this.focusMngr.magnet = this)
}

/**
 * Focus off this board.
 */
eYo.Board.Dflt_p.focusOff = function () {
  this.focusMain.board = eYo.NA
}

/**
 * Focus off this brick.
 * If there is a selected connection, it is removed.
 * `focusOff` is used from click handling methods.
 */
eYo.Brick.Dflt_p.focusOff = function () {
  this.hasFocus && (this.focusMngr.brick = eYo.NA)
}

/**
 * Focus off this magnet.
 * If `this` is the selected magnet, it looses its status.
 * `focusOff` is used from click handling methods.
 * Does nothing if the receiver is not selected.
 */
eYo.Magnet.Dflt_p.focusOff = function () {
  this.hasFocus && (this.focusMngr.magnet = eYo.NA)
}

/**
 * Focus off this field.
 * `focusOff` is used from click handling methods.
 */
eYo.Field.Dflt_p.focusOff = function () {
  this.hasFocus && (this.focusMngr.field = eYo.NA)
}
