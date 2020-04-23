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

eYo.require('msg')
eYo.require('stmt.group')
//g@@g.require('g@@g.dom');

/**
 * @name {eYo.stmt.control}
 * @constructor
 * Class for a Delegate, control brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
;(() => {
  var creation = 0
  eYo.stmt.group.makeSubC9r('control', {
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
    properties: {
      creation: {},
      /**
       * True for controls only.
       * @type {Boolean}
       * @readonly
       */
      isControl: {
        value: true,
        set: false,
      },
      /**
       * True for start statements only.
       * @type {Boolean}
       * @readonly
       */
      isMain: {
        value: true,
        set: false,
      },
    }
  })
}) ()

/**
 * Update the creation number.
 */
eYo.stmt.control_p.updateCreation = function () {
  this.creation__ = creation ++
}

/**
 * Run the script exported from the brick.
 * @private
 */
eYo.brick.BaseC9r_p.runScript = function () {
  console.log('Someone should everride this method to really run some script')
}

/**
 * Class for a Delegate, start_stmt.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.control.makeSubC9r('start_stmt', {
  xml: {
    attr: 'start'
  },
  left: eYo.NA, // override inherited
  right: eYo.NA, // override inherited
  head: eYo.t3.stmt.start_stmt,
  foot: eYo.t3.stmt.start_stmt,
})

