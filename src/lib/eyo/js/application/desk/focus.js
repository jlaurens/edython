/*
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
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
     * The manager that has the current focus
     * @type {?eYo.focus.Mngr}
     */
    mngr: eYo.NA,
    /**
     * The board that has current focus, if any
     * @type {eYo.board}
     */
    board: {
      get_ () {
        return this.mngr && this.mngr.board
      },
      set_ (after) {
        this.mngr_ = after && after.focus_mngr || eYo.NA
      },
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
        if (after && after.focus_mngr) {
          this.mngr_ = after.focus_mngr
          this.mngr_.brick_ = after
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
        if (after && after.focus_mngr) {
          this.mngr_ = after.focus_mngr
          this.mngr_.field_ = after
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
        if (after && after.focus_mngr) {
          this.mngr_ = after.focus_mngr
          this.mngr_.magnet_ = after
        }
      }
    },
    ui: {
      init () {
        this.owner.mngrForEach(m => m.initUI())
      },
      dispose () {
        this.owner.mngrForEach(m => m.disposeUI())
      },
    },
  },
  methods: {
    /**
     * Dispose of the 
     */
    mngrWillDispose (mngr) {
      this.mngrUnregister(mngr)
      if (this.mngr_ === mngr) {
        this.mngr_ = eYo.NA
      }
    }
  },
})

// Each newly created focus manager will come here
eYo.register.add(eYo.focus.Main, 'mngr')

/**
 * Create a standard focus manager, managed by a main focus manager.
 * @param {eYo.board} board -  the owner of the focus object.
 * @param {eYo.focus.Main} main -  The main focus manager.
 * @constructor
 */
eYo.focus.makeC9r('Mngr', {
  /**
   * 
   * @param {eYo.focus.Main} owner 
   */
  init () {
    this.focus_main.mngrRegister(this)
  },
  aliases: {
    owner: 'workspace',
    'app.focus_main': 'focus_main'
  },
  properties: {
    /**
     * Focus only on wrappers.
     * @type{eYo.board.Base}
     */
    board: {
      willChange (before, after) {
        before && before.ui_driver.off(after)
        after && (this.brick_ = this.magnet_ = this.field_ = eYo.NA)
      },
      didChange (after) {
        after && after.ui_driver.on(after)
      },
    },
    /**
     * Focus only on wrappers.
     * @type{eYo.brick.Base}
     */
    brick: {
      validate (after) {
        if (after) {
          if (!after.board) return eYo.INVALID
          return after.wrapper || after
        }
      },
      willChange(before, after) {
        before && before.ui_driver.off(before)
        if (after) {
          this.board_ = after.board
          let m4t = this.magnet
          if (m4t) {
            // before === m4t.wrapper
            var b3k = m4t.targetBrick
            if (!b3k || after !== b3k.wrapper) {
              this.magnet_ = eYo.NA
            }
          }
          let f3d = this.field
          if (f3d) {
            // before === f3d.wrapper
            this.field_ = eYo.NA
          }
        } else {
          this.magnet_ = this.field_ = eYo.NA
        }
      },
      didChange(after) {
        if (after) {
          after.ui_driver.on(after)
          this.didAdd()
        } else {
          this.didRemove()
        }
      },
    },
    /**
     * Takes care of consistency between the magnet and the brick.
     * @type{eYo.magnet.Base}
     */
    magnet: {
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
          if ((after.isLeft || after.isHead || after.isSlot) && after.target) {
            after = after.target
          }
          return after
        }
      },
      willChange(before, after) {
        before && before.ui_driver.off(before)
        if (after) {
          this.field_ = eYo.NA
          if (after.wrapper !== this.brick) {
            this.brick_ = eYo.NA
          }
        }
      },
      didChange (after) {
        if (after) {
          this.brick_ = after.brick
          after.ui_driver.on(after)
        }
      },
    },
    /**
     * Takes care of consistency between the field and the brick.
     * @type{eYo.field}
     * @private
     */
    field: {
      validate(after) {
        if (after) {
          if (!after.board) return eYo.INVALID
          return after
        }
      },
      willChange (before, after) {
        before && before.ui_driver.off(before)
        if (after) {
          this.magnet_ = eYo.NA
          if (after.wrapper !== this.brick) {
            this.brick_ = eYo.NA
          }
        }
      },
      didChange (after) {
        if (after) {
          this.brick_ = after.brick
          after.ui_driver.on(after)
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

eYo.board.Base.eyo.modelMerge({
  properties: {
    hasFocus: {
      get() {
        return this === this.focus_mngr.board
      },
      set (after) {
        after ? this.focusOn() : this.focusOff()
      }
    },
  },
  methods: {
    /**
     * Focus on this board.
     * @return {Boolean} Whether the receiver gained focus.
     */
    focusOn () {
      return !!(this.focus_main.board_ = this)
    },
    /**
     * Focus off this board.
     */
    focusOff () {
      this.focus_main.board_ = eYo.NA
    },
  },
})

eYo.brick.Base.eyo.modelMerge({
  properties: {
    hasFocus: {
      get() {
        return this === this.focus_mngr.brick
      },
      set (after) {
        after ? this.focusOn() : this.focusOff()
      }
    },
  },
  methods: {
    /**
     * Select this brick.  Highlight it visually.
     * Wrapped bricks are not selectable.
     * @param {Boolean} noBoard -  Do not focus on the receiver' board.
     * Defaults to false, which means that focusing on an object
     * also focuses on its enclosing board.
     * @return {Boolean} Whether the receiver gained focus.
     */
    focusOn (noBoard) {
      noBoard || this.board.focusOn()
      return !!(this.focus_mngr.brick_ = this)
    },
    /**
     * Focus off this brick.
     * If there is a selected connection, it is removed.
     * `focusOff` is used from click handling methods.
     */
    focusOff () {
      this.hasFocus && (this.focus_mngr.brick_ = eYo.NA)
    },
  },
})

eYo.magnet.Base.eyo.modelMerge({
  properties: {
    hasFocus: {
      get() {
        return this === this.focus_mngr.magnet
      },
      set (after) {
        after ? this.focusOn() : this.focusOff()
      }
    },
  },
  methods: {
    /**
     * Select this magnet. Highlight it visually.
     * Wrapped magnets are not selectable.
     * @param {Boolean} noBoard -  Do not focus on the receiver' board.
     * Defaults to false, which means that focusing on an object
     * also focuses on its enclosing board.
     * @return {Boolean} Whether the receiver gained focus.
     */
    focusOn (noBoard) {
      noBoard || this.board.focusOn()
      return !!(this.focus_mngr.magnet_ = this)
    },
    /**
     * Focus off this magnet.
     * If `this` is the selected magnet, it looses its status.
     * `focusOff` is used from click handling methods.
     * Does nothing if the receiver is not selected.
     */
    focusOff () {
      this.hasFocus && (this.focus_mngr.magnet_ = eYo.NA)
    },
  },
})

eYo.field.Base.eyo.modelMerge({
  properties: {
    hasFocus: {
      get() {
        return this === this.focus_mngr.field
      },
      set (after) {
        after ? this.focusOn() : this.focusOff()
      },
    },
  },
  methods: {
    /**
     * Select this field. Highlight it visually.
     * @param {Boolean} noBoard -  Do not focus on the receiver' board.
     * Defaults to false, which means that focusing on an object
     * also focuses on its enclosing board.
     * @return {Boolean} Whether the receiver gained focus.
     */
    focusOn (noBoard) {
      noBoard || this.board.focusOn()
      return !!(this.focus_mngr.field_ = this)
    },
    /**
     * Focus off this field.
     * `focusOff` is used from click handling methods.
     */
    focusOff () {
      this.hasFocus && (this.focus_mngr.field_ = eYo.NA)
    },
  },
})
