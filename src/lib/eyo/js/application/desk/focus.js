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
 * The main focus manager belongs to the application owning all the boards.
 * It takes care of remembering which board has the focus.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('decorate')

eYo.require('do')
eYo.require('board')

eYo.require('brick')
eYo.require('magnet')
eYo.require('field')
eYo.forwardDeclare('app')

/**
 * @name{eYo.focus}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'focus')

/**
 * @name {eYo.focus.Main}
 * @constructor
 * The main focus manager is uniquely owned by the application.
 * It maintains a list of focus managers associated to boards.
 * @param {eYo.app.Base} app -  the owning application.
 * @constructor
 */
eYo.focus.makeC9r('Main', {
  properties: {
    /**
     * The board that has current focus, if any
     * @type {eYo.board}
     */
    board: {
      get () {
        return this.mngr && this.mngr.board
      },
      set (after) {
        if (after !== this.board) {
          this.hasUI && this.ui_driver.boardOff(this)
          this.mngr_ = after && after.focus_mngr || eYo.NA
          this.hasUI && this.ui_driver.boardOn(this)
        }
      }
    },
    /**
     * The brick that has current focus, if any
     * @type {?eYo.brick.Base}
     */
    brick: {
      get () {
        return this.mngr_ && this.mngr_.brick
      },
      set (after) {
        if (after && this.mngr_) {
          this.mngr_ = after.focus_mngr
          this.mngr_.brick = after
        }
      }
    },
    /**
     * The field that has current focus, if any
     * @type {?eYo.field}
     */
    field: {
      get () {
        return this.mngr_ && this.mngr_.field
      },
      set (after) {
        if (after && this.mngr_) {
          this.mngr_ = after.focus_mngr
          this.mngr_.field = after
        }
      }
    },
    /**
     * The magnet that has current focus, if any
     * @type {!eYo.magnet.Base}
     */
    magnet: {
      get () {
        return this.mngr_ && this.mngr_.magnet
      },
      set (after) {
        if (after && this.mngr_) {
          this.mngr_ = after.focus_mngr
          this.mngr_.magnet = after
        }
      }
    },
    /**
     * The manager that has current focus
     * @type {?eYo.focus.Mngr}
     */
    mngr: eYo.NA,
    ui: {
      init () {
        this.mngrForEach(m => m.initUI())
      },
      dispose () {
        this.mngrForEach(m => m.disposeUI())
      },
    },
  },
})

// Each newly created focus manager comes here
eYo.do.register.add(eYo.focus.Main, 'mngr')

/**
 * Dispose of the 
 */
eYo.focus.Main_p.mngrWillDispose = function (mngr) {
  this.mngrUnregister(mngr)
  if (this.mngr_ === mngr) {
    this.mngr_ = null
  }
}
/**
 * Create a standard focus manager, managed by a main focus manager.
 * @param {eYo.board} board -  the owner of the focus object.
 * @param {eYo.focus.Main} main -  The main focus manager.
 * @constructor
 */
eYo.focus.makeC9r('Mngr', {
  init () {
    this.focus_main.mngrRegister(this)
  },
  properties: {
    /**
     * The owning board.
     * @type {eYo.board.Base}
     */
    board () {
      return this.owner__
    },
    focus_main () {
      return this.app.focus_main
    },
    /**
     * Focus only on wrappers.
     * @type{eYo.brick.Base}
     */
    brick: {
      validate (after) {
        return after && after.wrapper || after
      },
      willChange(before, after) {
        this.hasUI && before && before.ui_driver.off(this)
      },
      didChange(after) {
        if (after) {
          let m4t = this.magnet__
          if (m4t) {
            var b3k = m4t.brick
            if (b3k && after !== b3k.wrapper) {
              this.magnet_ = eYo.NA
            }
          }
          let f3d = this.field
          if (f3d) {
            var b3k = f3d.brick
            if (b3k && after !== b3k.wrapper) {
              this.field_ = eYo.NA
            }
          }
          this.hasUI && this.value.ui_driver.on(this)
          this.didAdd()
        } else {
          this.magnet_ = eYo.NA
          this.field_ = eYo.NA
          this.didRemove()
        }
      },
    },
    /**
     * Takes care of consistency between the magnet and the brick.
     * @type{eYo.magnet.Base}
     */
    magnet: {
      willChange() {
        this.hasUI && this.ui_driver.magnetOff(this)
        this.field_ = null
      },
      validate(after) {
        if (after) {
          if (!after.board) return eYo.INVALID
          if (after.hidden_) {
            console.error('Do not select a hidden connection')
            return eYo.INVALID
          }
          var b3k = after.brick
          if (b3k && b3k.locked_) {
            return eYo.INVALID
          }
          // if the connection visually belongs to 2 bricks, select the top left most
          if ((after.isHead || after.isSlot) && after.target) {
            after = after.target
          }
          return after
        }
      },
      didChange (after) {
        if (after) {
          this.brick_ = after.brick.wrapper
        }
        this.hasUI && this.ui_driver.magnetOn(this)
      },
    },
    /**
     * Takes care of consistency between the field and the brick.
     * @type{eYo.field}
     * @private
     */
    field: {
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
  },
  dispose (builtin) {
    this.focus_main.mngrWillDispose(this)
    builtin()
  },
})

/**
 * Scroll the focused brick to visible.
 * UI related.
 */
eYo.focus.Mngr_p.scrollToVisible = function (force) {
  this.brick && this.brick.scrollToVisible(force)
}

/**
 * Hook.
 */
eYo.focus.Mngr_p.didAdd = eYo.doNothing

/**
 * Hook.
 */
eYo.focus.Mngr_p.didRemove = eYo.doNothing

/**
 * Select one of the given bricks.
 * @param {Array<eYo.brick.Base>} bricks
 * @param {Boolean} force
 */
eYo.focus.Mngr_p.selectOneBrickOf = function (bricks, force) {
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

eYo.o4t.Base.eyo.propertiesMerge({
  focus_main: {
    get () {
      this.app.focus_main
    },
  },
  focus_mgr: {
    get () {
      this.owner.focus_mgr
    },
  },
})

eYo.brick.Base.eyo.propertiesMerge({
  hasFocus: {
    get() {
      return this === this.focus_mngr.brick
    },
    set (after) {
      after ? this.focusOn() : this.focusOff()
    }
  },
})

eYo.magnet.Base.eyo.propertiesMerge({
  hasFocus: {
    get() {
      return this === this.focus_mngr.magnet
    },
    set (after) {
      after ? this.focusOn() : this.focusOff()
    }
  },
})

eYo.field.Base.eyo.propertiesMerge({
  hasFocus: {
    get() {
      return this === this.focus_mngr.field
    },
    set (after) {
      after ? this.focusOn() : this.focusOff()
    },
  },
})

eYo.view.Workspace.eyo.propertiesMerge({
  /**
   * The main focus manager.
   * @type {?eYo.focus.Main} 
   */
  focus_main: {
    value () {
      return new eYo.focus.Main(this)
    },
  },
})

/**
 * Focus on this board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.board.Base_p.focusOn = function () {
  return !!(this.focus_main.board = this)
}

/**
 * Select this brick.  Highlight it visually.
 * Wrapped bricks are not selectable.
 * @param {Boolean} noBoard -  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.brick.Base_p.focusOn = function (noBoard) {
  noBoard || this.board.focusOn()
  return !!(this.focus_mngr.brick = this)
}

/**
 * Select this field. Highlight it visually.
 * @param {Boolean} noBoard -  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.field.Base_p.focusOn = function (noBoard) {
  noBoard || this.board.focusOn()
  return !!(this.focus_mngr.field = this)
}

/**
 * Select this magnet. Highlight it visually.
 * Wrapped magnets are not selectable.
 * @param {Boolean} noBoard -  Do not focus on the receiver' board.
 * Defaults to false, which means that focusing on an object
 * also focuses on its enclosing board.
 * @return {Boolean} Whether the receiver gained focus.
 */
eYo.magnet.Base_p.focusOn = function (noBoard) {
  noBoard || this.board.focusOn()
  return !!(this.focus_mngr.magnet = this)
}

/**
 * Focus off this board.
 */
eYo.board.Base_p.focusOff = function () {
  this.focus_main.board = eYo.NA
}

/**
 * Focus off this brick.
 * If there is a selected connection, it is removed.
 * `focusOff` is used from click handling methods.
 */
eYo.brick.Base_p.focusOff = function () {
  this.hasFocus && (this.focus_mngr.brick = eYo.NA)
}

/**
 * Focus off this magnet.
 * If `this` is the selected magnet, it looses its status.
 * `focusOff` is used from click handling methods.
 * Does nothing if the receiver is not selected.
 */
eYo.magnet.Base_p.focusOff = function () {
  this.hasFocus && (this.focus_mngr.magnet = eYo.NA)
}

/**
 * Focus off this field.
 * `focusOff` is used from click handling methods.
 */
eYo.field.Base_p.focusOff = function () {
  this.hasFocus && (this.focus_mngr.field = eYo.NA)
}
