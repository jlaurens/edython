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

eYo.require('msg')
eYo.require('stmt.Group')
goog.require('goog.dom');

/**
 * @name {eYo.stmt.Control}
 * @constructor
 * Class for a Delegate, control brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
;(() => {
  var creation = 0
  eYo.stmt.Group.makeSubclass('Control', {
    data: {
      restart: {
        init: false,
        xml: {
          save: /** @suppress{globalThis} */ function (element) {
            if (this.get()) {
              element.setAttribute(eYo.key.RESTART, eYo.key.TRUE)
            }
          },
          load: /** @suppress{globalThis} */ function (element) {
            var attr = element.getAttribute(eYo.key.RESTART)
            if (attr === eYo.key.TRUE) {
              this.set(true)
            }
          }
        }
      },
    },
    valued: {
      creation: {},
      /**
       * True for controls only.
       * @type {Boolean}
       * @readonly
       */
      isControl: {
        value: true,
        set: eYo.do.noSetter,
      },
      /**
       * True for start statements only.
       * @type {Boolean}
       * @readonly
       */
      isMain: {
        value: true,
        set: eYo.do.noSetter,
      },
    }
  })
}) ()

/**
 * Update the creation number.
 */
eYo.stmt.Control.prototype.updateCreation = function () {
  this.creation__ = creation ++
}

/**
 * Run the script exported from the brick.
 * @private
 */
eYo.brick.Dflt.prototype.runScript = function () {
  console.log('Someone should everride this method to really run some script')
}

/**
 * Class for a Delegate, start_stmt.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.Control.makeSubclass('Start_stmt', {
  xml: {
    attr: 'start'
  },
  left: eYo.NA, // override inherited
  right: eYo.NA, // override inherited
  head: eYo.t3.stmt.Start_stmt,
  foot: eYo.t3.stmt.Start_stmt,
})

eYo.stmt.Control.T3s = [
  eYo.t3.stmt.Start_stmt
]
