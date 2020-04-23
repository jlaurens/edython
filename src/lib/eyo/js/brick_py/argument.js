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

/**
 * List consolidator for argument list.
 * Main entry: consolidate
 * argument_list        ::=  positional_arguments ["," starred_and_keywords]
                            ["," keywords_arguments]
                          | starred_and_keywords ["," keywords_arguments]
                          | keywords_arguments
positional_arguments ::=  ["*"] expression ("," ["*"] expression)*
starred_and_keywords ::=  ("*" expression | keyword_item)
                          ("," "*" expression | "," keyword_item)*
keywords_arguments   ::=  (keyword_item | "**" expression)
                          ("," keyword_item | "," "**" expression)*
keyword_item         ::=  identifier "=" expression
 * We rephrase it as
 * argument_list_1 ::= ["*"] expression ("," ["*"] expression)* ["," keyword_item ["," starred_and_keywords]] ["," "**" expression ["," keywords_arguments]]
 * argument_list_2 ::= keyword_item ["," starred_and_keywords] ["," "**" expression ["," keywords_arguments]]
 * argument_list_3 ::= "**" expression ["," keywords_arguments]
 * argument_list ::=  argument_list_1 | argument_list_2 | argument_list_3
 * We have 4 kinds of objects, which make 24 ordering possibilities
 * RULE 1 : expression << keyword_item
 * RULE 2 : expression << "**" expression
 * RULE 3 : "*" expression << "**" expression
 */
eYo.consolidator.List.makeSubC9r('Arguments', {
  list: {
    check: null,
    mandatory: 0,
    presep: ',',
  },
})

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {eYo.brick.BaseC9r} brick - owner or the receiver.
 */
eYo.consolidator.Arguments.prototype.getIO = function (brick) {
  var io = eYo.consolidator.Arguments.eyo.C9r_s.getIO.call(this, brick)
  io.last_expression = io.last_positional = io.unique = -Infinity
  io.first_keyword_star_star = io.first_star_star = Infinity
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.consolidator.Arguments.prototype.doCleanup = (() => {
  // preparation: walk through the list of inputs and
  // find the key inputs
  var Type = {
    UNCONNECTED: 0,
    ARGUMENT: 1,
    STAR: 2,
    STAR_STAR: 3,
    KEYWORD: 4,
    COMPREHENSION: 5
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.slot is connected.
   * @param {Object} io - parameters....
   */
  var getCheckType = (io) => {
    var target = io.m4t.target
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (check) {
      if (eYo.do.arrayContains(check, eYo.t3.expr.comprehension)) {
        return Type.COMPREHENSION
      } else if (eYo.do.arrayContains(check, eYo.t3.expr.expression_star_star)) {
        return Type.STAR_STAR
      } else if (eYo.do.arrayContains(check, eYo.t3.expr.expression_star)) {
        return Type.STAR
      } else if (eYo.do.arrayContains(check, eYo.t3.expr.identifier_valued)) {
        return Type.KEYWORD
      } else {
        return Type.ARGUMENT
      }
    } else {
      // this is for 'any' expression (blank expression)
      // bad answer because we should check for the type of the brick
      return Type.ARGUMENT
    }
  }
  var setupFirst = function (io) {
    io.last_expression = io.last_positional = io.unique = -Infinity
    io.first_keyword_star_star = io.first_star_star = Infinity
    this.setupIO(io, 0)
    while (!!io.slot && io.unique < 0) {
      switch ((io.slot.parameter_type_ = getCheckType(io))) {
      case Type.ARGUMENT:
        io.last_expression = io.i
      case Type.STAR:
        io.last_positional = io.i
        break
      case Type.STAR_STAR:
        if (io.first_star_star === Infinity) {
          io.first_star_star = io.i
        }
      case Type.KEYWORD:
        if (io.first_keyword_star_star === Infinity) {
          io.first_keyword_star_star = io.i
        }
        break
      case Type.COMPREHENSION:
        io.unique = io.i
      }
      this.nextSlot(io)
    }
  }
  return function (io) {
    eYo.consolidator.Arguments.eyo.C9r_s.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.unique !== -Infinity) {
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
    }
  }
})()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {Object} io parameter.
 */
eYo.consolidator.Arguments.prototype.getCheck = (() => {
  var cache = {}
  return function (io) {
    var can_expression, can_expression_star, can_expression_star_star, can_keyword, can_comprehension
    if (this.model.can_comprehension && (io.unique >= 0 || io.list.length === 1 || (io.list.length === 3 && io.i === 1))) {
      can_expression = can_expression_star = can_expression_star_star = can_keyword = can_comprehension = true
    } else {
      can_comprehension = false
      can_expression = io.i <= io.first_keyword_star_star
      can_expression_star = io.i <= io.first_star_star
      can_keyword = io.i >= io.last_expression
      can_expression_star_star = io.i >= io.last_positional
    }
    var K = 0
    if (can_expression) {
      K += 1
    }
    if (can_expression_star) {
      K += 2
    }
    if (can_expression_star_star) {
      K += 4
    }
    if (can_keyword) {
      K += 8
    }
    if (can_comprehension) {
      K += 16
    }
    var out = cache[K]
    if (out) {
      return out
    }
    out = []
    if (can_expression) {
      out = eYo.t3.expr.check.expression.Slice()
    }
    if (can_expression_star) {
      out.push(eYo.t3.expr.expression_star)
    }
    if (can_keyword) {
      out.push(eYo.t3.expr.identifier_valued)
    }
    if (can_expression_star_star) {
      out.push(eYo.t3.expr.expression_star_star)
    }
    if (can_comprehension) {
      out.push(eYo.t3.expr.comprehension)
    }
    return (cache[K] = out)
  }
})()

/**
 * Class for a Delegate, argument_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List.makeSubC9r('argument_list', {
  data: {
    ary: {
      order: 200,
      init: Infinity,
      xml: false,
      noUndo: true,
      validate (after) /** @suppress {globalThis} */ {
        return eYo.isNum(after) ? after : Infinity
      },
      didChange (builtin) /** @suppress {globalThis} */ {
        builtin()
        this.changer.wrap(() => {
          this.brick.createConsolidator(true)
        })
      }
    },
    mandatory: {
      order: 300,
      init: 0,
      xml: false,
      noUndo: true,
      didChange (builtin) /** @suppress {globalThis} */ {
        builtin()
        this.changer.wrap(() => {
          this.brick.createConsolidator(true)
        })
      }
    }
  },
  list: {
    consolidator: eYo.consolidator.Arguments,
    presep: ','
  }
})

/**
 * Class for a Delegate, argument_list_comprehensive brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.argument_list.makeSubC9r('argument_list_comprehensive', {
  list: {
    can_comprehension: true
  }
})
