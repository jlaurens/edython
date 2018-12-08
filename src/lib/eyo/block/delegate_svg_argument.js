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

goog.provide('eYo.DelegateSvg.Argument')

goog.require('eYo.DelegateSvg.List')

/**
 * Class for a DelegateSvg, keyword_item block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
// eYo.DelegateSvg.Expr.makeSubclass('keyword_item', {
//   slots: {
//     identifier: {
//       order: 1,
//       check: eYo.T3.Expr.identifier,
//       hole_value: 'key'
//     },
//     expression: {
//       order: 3,
//       fields: {
//         label: '='
//       },
//       check: eYo.T3.Expr.Check.expression,
//       hole_value: 'value'
//     }
//   }
// })

/**
 * List consolidator for argument list.
 * Rules are a bit stronger than python requires originally
 * 1) If there is a comprehension, it must be alone.
 * 2) positional arguments come first, id est expression and starred expressions
 * 3) then come keyword items or double starred expressions
 * Main entry: consolidate
 */
eYo.Consolidator.List.makeSubclass('Arguments', {
  check: null,
  presep: ','
}, eYo.Consolidator.List, eYo.Consolidator)

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
eYo.Consolidator.Arguments.prototype.getIO = function (block) {
  var io = eYo.Consolidator.Arguments.superClass_.getIO.call(this, block)
  io.first_keyword = io.last_positional = io.unique = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.Arguments.prototype.doCleanup = (function () {
  // preparation: walk through the list of inputs and
  // find the key inputs
  var Type = {
    UNCONNECTED: 0,
    ARGUMENT: 1,
    KEYWORD: 2,
    COMPREHENSION: 3
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function (io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (check) {
      if (goog.array.contains(check, eYo.T3.Expr.comprehension)) {
        io.unique = io.i
        return Type.COMPREHENSION
      } else if (goog.array.contains(check, eYo.T3.Expr.expression_star_star) || goog.array.contains(check, eYo.T3.Expr.keyword_item)) {
        return Type.KEYWORD
      } else {
        return Type.ARGUMENT
      }
    } else {
      // this is for 'any' expression
      // bad answer because we should check for the type of the block
      return Type.ARGUMENT
    }
  }
  var setupFirst = function (io) {
    io.first_keyword = io.last_positional = io.unique = -1
    this.setupIO(io, 0)
    while (!!io.eyo && io.unique < 1) {
      switch ((io.eyo.parameter_type_ = getCheckType(io))) {
      case Type.ARGUMENT:
        io.last_positional = io.i
        break
      case Type.KEYWORD:
        if (io.first_keyword < 0) {
          io.first_keyword = io.i
        }
        break
      case Type.COMPREHENSION:
        io.unique = io.i
      }
      this.nextInput(io)
    }
  }
  return function (io) {
    eYo.Consolidator.Arguments.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.unique >= 0) {
      // remove whatever comes before and after the io.unique
      this.setupIO(io, 0)
      while (io.i < io.unique--) {
        this.disposeAtI(io)
        this.setupIO(io)
      }
      this.setupIO(io, 1)
      while (io.i < io.list.length) {
        this.disposeAtI(io)
        this.setupIO(io)
      }
    } else
    // move parameters that are not placed correctly (in eYo sense)
    if (io.first_keyword >= 0) {
      while (io.first_keyword < io.last_positional) {
        this.setupIO(io, io.first_keyword + 2)
        while (io.i <= io.last_positional) {
          if (io.eyo.parameter_type_ === Type.ARGUMENT) {
            // move this to io.first_keyword
            var c8n = io.c8n
            var target = c8n.targetConnection
            c8n.disconnect()
            while (io.i > io.first_keyword) {
              this.setupIO(io, io.i - 2)
              var t = io.c8n.targetConnection
              io.c8n.disconnect()
              c8n.connect(t)
              c8n = io.c8n
            }
            c8n.connect(target)
            io.first_keyword += 2
            this.setupIO(io, io.first_keyword + 2)
          } else {
            this.setupIO(io, io.i + 2)
          }
        }
        // io.last_positional = io.first_keyword - 2
        setupFirst.call(this, io)
      }
    }
  }
}())

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
eYo.Consolidator.Arguments.prototype.getCheck = (function () {
  var cache = {}
  return function (io) {
    var can_positional, can_keyword, can_comprehension
    if (io.unique >= 0 || io.list.length === 1 || (io.list.length === 3 && io.i === 1)) {
      can_positional = can_keyword = can_comprehension = true
    } else {
      can_comprehension = false
      if (io.first_keyword < 0 || io.i <= io.first_keyword) {
        can_positional = true
      }
      if (io.i >= io.last_positional) {
        can_keyword = true
      }
    }
    var K = 0
    if (can_positional) {
      K += 1
    }
    if (can_keyword) {
      K += 2
    }
    if (can_comprehension) {
      K += 4
    }
    var out = cache[K]
    if (out) {
      return out
    }
    out = []
    if (can_positional) {
      out = eYo.T3.Expr.Check.expression.slice()
      out.push(eYo.T3.Expr.expression_star)
    }
    if (can_keyword) {
      out.push(eYo.T3.Expr.keyword_item)
      out.push(eYo.T3.Expr.expression_star_star)
    }
    if (can_comprehension) {
      out.push(eYo.T3.Expr.comprehension)
    }
    return (cache[K] = out)
  }
}())

/**
 * Class for a DelegateSvg, argument_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('argument_list', {
  data: {
    ary: {
      order: 200,
      init: Infinity,
      xml: false,
      noUndo: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: goog.isNumber(newValue) ? newValue : Infinity}
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.owner.changeWrap(
          function () {
            this.createConsolidator(true)
            this.consolidator.model.ary = newValue
          }
        )
      }
    },
    mandatory: {
      order: 300,
      init: 0,
      xml: false,
      noUndo: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.changeWrap(
          function () {
            this.createConsolidator(true)
            this.consolidator.model.mandatory = newValue
            this.consolidator.model.empty = !newValue    
          }
        )
      }
    }
  },
  list: {
    check: eYo.T3.Expr.Check.argument_any,
    consolidator: eYo.Consolidator.List,
    presep: ',',
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, argument_list_comprehensive block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.argument_list.makeSubclass('argument_list_comprehensive', {
  data: {
    ary: {
      init: 3
    },
    mandatory: {
      init: 1
    }
  },
  list: {
    consolidator: eYo.Consolidator.Arguments,
    presep: ',',
    hole_value: 'name'
  }
})

eYo.DelegateSvg.Argument.T3s = [
  // eYo.T3.Expr.keyword_item,
  eYo.T3.Expr.starred_item_list, // from Expr
  eYo.T3.Expr.argument_list,
  eYo.T3.Expr.argument_list_comprehensive
]
