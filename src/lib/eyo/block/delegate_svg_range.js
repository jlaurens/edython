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

goog.provide('eYo.DelegateSvg.Range')

goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.DelegateSvg.Argument')

console.warn('Move this block to the builtin blocks, with contextual consolidator and argument list')

goog.provide('eYo.DelegateSvg.Argument.range')

/**
 * List consolidator for argument list.
 * Rules are a bit stronger than python requires originally
 * 1) If there is a comprehension, it must be alone.
 * 2) positional arguments come first, id est expression and starred expressions
 * 3) then come keyword items or double starred expressions
 * Main entry: consolidate
 */
eYo.Consolidator.Arguments.makeSubclass('Range', {
  check: null,
  empty: false,
  presep: ','
}, null, eYo.Consolidator)

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.Range.prototype.doFinalize = function (io) {
  eYo.Consolidator.Range.superClass_.doFinalize.call(this, io)
  this.setupIO(io, 0)
  var i = 0
  do {
    if (io.c8n.isConnected()) {
      ++i
    }
  } while (this.nextInput(io))
  if (i>=3) {
    i = 3
    // remove any input that is not connected
    // and any supplemental connected input
    this.setupIO(io, 0)
    while(true) {
      if (io.c8n.eyo.s7r_) {
        io.c8n.eyo.disabled_ = true
        if (this.nextInput(io)) {
          continue
        }
      } else if (i) {
        if (io.c8n.isConnected()) {
          i--
          if (this.nextInput(io)) {
            continue
          }
        }
        // logically unreachable code because any unconnected
        // input is a separator and should have been catched in
        // in the previous if clause
      } else {
        console.warn('Remove block', i)
        var target = io.c8n.targetBlock()
        target = target.dispose()
        if (this.disposeAtI(io)) {
          // 3 connections were found
          continue
        }
      }
      break
    }
  }
}

/**
 * Class for a DelegateSvg, range_argument_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.argument_list.makeSubclass('range_argument_list', {
  list: {
    consolidator: eYo.Consolidator.Range,
    hole_value: 'name'
  }
}, null, eYo.DelegateSvg)

/**
 * Class for a DelegateSvg, range block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.base_call_expr.makeSubclass('builtin__range', {
  data: {
    ary: {
      init: '3',
      synchronize: true
    },
    name: {
      init: 'range',
      synchronize: true,
      validate: false,
      undo: false,
      xml: false
    }
  },
  slots: {
    name: {
      order: 50,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER
        }
      }
    },
    n_ary: null,
    z_ary: null,
    unary: null,
    binary: null,
    ternary: null,
    quadary: null,
    pentary: null,
    arguments: {
      order: 1000,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.range_argument_list
    }
  },
  output: {
    check: [eYo.T3.Expr.builtin__range, eYo.T3.Expr.call_expr]
  }
})

eYo.DelegateSvg.Range.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Expr.builtin__range
]
