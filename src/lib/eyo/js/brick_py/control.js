/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('goog.ui.Dialog')

eYo.require('eYo.Msg')
eYo.require('eYo.NS_Brick.Group')
goog.require('goog.dom');
eYo.provide('eYo.NS_Brick.Control')

/**
 * Class for a Delegate, control brick.
 * Not normally called directly, eYo.NS_Brick.create(...) is preferred.
 * For edython.
 */
eYo.NS_Brick.BaseGroup.makeSubclass('Control', {
  data: {
    restart: {
      init: false,
      xml: {
        save: /** @suppress{globalThis} */ function (element) {
          if (this.get()) {
            element.setAttribute(eYo.Key.RESTART, eYo.Key.TRUE)
          }
        },
        load: /** @suppress{globalThis} */ function (element) {
          var attr = element.getAttribute(eYo.Key.RESTART)
          if (attr === eYo.Key.TRUE) {
            this.set(true)
          }
        }
      }
    }
  }
}, eYo.NS_Brick)

/**
 * Update the creation number.
 */
eYo.NS_Brick.Control.prototype.updateCreation = (() => {
  var creation
  return function () {
    if (goog.isDef(creation)) {
      this.creation__ = ++ creation
    } else {
      this.creation__ = creation = 0
    }
  }
})()

Object.defineProperties (eYo.NS_Brick.Control.prototype, {
  creation: {
    get() {
      return this.creation__
    }
  },
  /**
   * True for controls only.
   * @type {Boolean}
   * @readonly
   */
  isControl: {
    value: true
  },
})

/**
 * Run the script exported from the brick.
 * @private
 */
eYo.NS_Brick.Dflt.prototype.runScript = function () {
  console.log('Someone should everride this method to really run some script')
}

/**
 * Class for a Delegate, start_stmt.
 * Not normally called directly, eYo.NS_Brick.create(...) is preferred.
 * For edython.
 */
eYo.NS_Brick.Control.makeSubclass('start_stmt', {
  xml: {
    attr: 'start'
  },
  left: eYo.NA, // override inherited
  right: eYo.NA, // override inherited
  head: {
    check: eYo.T3.Stmt.start_stmt
  },
  foot: {
    check: eYo.T3.Stmt.start_stmt
  }
})

Object.defineProperties (eYo.NS_Brick.Control.prototype, {
  /**
   * True for start statements only.
   * @type {Boolean}
   * @readonly
   */
  isMain: {
    value: true
  },
})

eYo.NS_Brick.Control.T3s = [
  eYo.T3.Stmt.start_stmt
]
