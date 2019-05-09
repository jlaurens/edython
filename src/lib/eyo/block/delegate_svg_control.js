/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Control')

goog.require('goog.ui.Dialog')
goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Group')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, control block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.BaseGroup.makeSubclass('Control', {
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
}, eYo.DelegateSvg)

/**
 * True for controls only.
 */
eYo.DelegateSvg.Control.prototype.isControl = true

/**
 * Update the black count.
 * May be called very early.
 */
eYo.DelegateSvg.Control.prototype.updateBlackHeight = function () {
  this.blackHeight = this.magnets.suite && this.magnets.suite.target ? 0 : 1
}

/**
 * Update the creation number.
 */
eYo.DelegateSvg.Control.prototype.updateCreation = (() => {
  var creation
  return function () {
    if (goog.isDef(creation)) {
      this.creation__ = ++ creation
    } else {
      this.creation__ = creation = 0
    }
  }
})()

Object.defineProperties (eYo.DelegateSvg.Control.prototype, {
  creation: {
    get() {
      return this.creation__
    }
  }
})

eYo.DelegateSvg.Control.prototype.willRender_ = function (recorder) {
  eYo.DelegateSvg.Control.superClass_.willRender_.call(this, recorder)
  this.span.minWidth = this.block_.width = Math.max(this.block_.width, 2 * eYo.Font.tabWidth)
}

/**
 * Run the script exported from the block.
 * @private
 */
eYo.DelegateSvg.prototype.runScript = function () {
  console.log('Someone should everride this method to really run some script')
}

/**
 * Class for a DelegateSvg, start_stmt.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Control.makeSubclass('start_stmt', {
  xml: {
    attr: 'start'
  },
  statement: {
    left: undefined, // override inherited
    right: undefined, // override inherited
    high: {
      check: eYo.T3.Stmt.start_stmt
    },
    low: {
      check: eYo.T3.Stmt.start_stmt
    }
  }
})

eYo.DelegateSvg.Control.T3s = [
  eYo.T3.Stmt.start_stmt
]
