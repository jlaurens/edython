/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Argument')

goog.require('ezP.DelegateSvg.List')

/**
 * Class for a DelegateSvg, keyword_item block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.keyword_item = function (prototypeName) {
  ezP.DelegateSvg.Expr.keyword_item.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.keyword_item
  this.inputModel_ = {
    first: {
      key: ezP.Const.Input.LHS,
      check: ezP.T3.Expr.identifier,
      hole_value: 'key',
    },
    last: {
      label: '=',
      key: ezP.Const.Input.RHS,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'value',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.keyword_item, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('keyword_item')

/**
 * Class for a DelegateSvg, expression_star block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.expression_star = function (prototypeName) {
  ezP.DelegateSvg.Expr.expression_star.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.expression_star
  this.inputModel_ = {
    first: {
      label: '*',
      key: ezP.Const.Input.EXPR,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'value',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.expression_star, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('expression_star')

/**
 * Class for a DelegateSvg, expression_star_star block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.expression_star_star = function (prototypeName) {
  ezP.DelegateSvg.Expr.expression_star_star.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.expression_star_star
  this.inputModel_ = {
    first: {
      label: '**',
      key: ezP.Const.Input.EXPR,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'value',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.expression_star_star, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('expression_star_star')

/**
 * List consolidator for argument list.
 * Rules are a bit stronger than python requires originally
 * 1) If there is a comprehension, it must be alone.
 * 2) positional arguments come first, id est expression and starred expressions
 * 3) then come keyword items or double starred expressions
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.Arguments = function() {
  ezP.Consolidator.Arguments.superClass_.constructor.call(this, ezP.Consolidator.Arguments.data)
}
goog.inherits(ezP.Consolidator.Arguments, ezP.Consolidator.Singled)

ezP.Consolidator.Arguments.data = {
  check: null,
  empty: true,
  sep: ',',
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.Arguments.prototype.prepareToWalk = function(io) {
  ezP.Consolidator.Arguments.superClass_.prepareToWalk.call(this, io)
  io.first_connected = undefined
  io.last_comprehension = undefined
  io.first_keyword_or_star_star = undefined
  io.first_star_star = undefined
  io.last_positional = undefined // either expression or starred expression
  io.last_expression = undefined
  io.errors = 0
}

ezP.Consolidator.Arguments.Type = {
  unconnected: 'unconnected',
  comprehension: 'comprehension',
  expression: 'expression',
  expression_star: 'expression_star',
  keyword_item: 'keyword_item',
  expression_star_star: 'expression_star_star',
}

/**
 * Whether the input corresponds to a comprehension argument.
 * @param {Object} io, parameters....
 */
ezP.Consolidator.Arguments.prototype.getCheckType = function(io) {
  var target = io.c8n.targetConnection
  if (!target) {
    return ezP.Consolidator.Arguments.Type.unconnected
  }
  var check = target.check_
  if (goog.array.contains(check, ezP.T3.Expr.comprehension)) {
    return ezP.Consolidator.Arguments.Type.comprehension
  } else if (goog.array.contains(check,ezP.T3.Expr.expression_star)) {
    return ezP.Consolidator.Arguments.Type.expression_star
  } else if (goog.array.contains(check,ezP.T3.Expr.keyword_item)) {
    return ezP.Consolidator.Arguments.Type.keyword_item
  } else if (goog.array.contains(check,ezP.T3.Expr.expression_star_star)) {
    return ezP.Consolidator.Arguments.Type.expression_star_star
  } else {
    return ezP.Consolidator.Arguments.Type.expression
  }
}

/**
 * Call the inherited method, then records the various first_... indices
 */
ezP.Consolidator.Arguments.prototype.one_step = function(io) {
  // inherit
  ezP.Consolidator.Arguments.superClass_.one_step.call(this, io)
  // move input around if necessary
  io.ezp.argument_type_ = this.getCheckType(io)
  io.ezp.error_ = false
  if (io.ezp.argument_type_ == ezP.Consolidator.Arguments.Type.unconnected) {
    return
  }
  if (!this.first_connected) {
    this.first_connected = io.input
  }
  var i = undefined
  switch(io.ezp.argument_type_) {
    case ezP.Consolidator.Arguments.Type.comprehension:
      if (io.last_comprehension) {
        // will insert just after io.last_comprehension
        i = goog.array.indexOf(io.list, io.last_comprehension) + 1
        io.last_comprehension = io.input
        // move this input in front, after the last comprehension
        goog.asserts.assert(i <= io.i, 'Internal inconsistency: '+i+ ' <= '+io.i)
        if (i < io.i) {
          // the input is not already located at the expected location
          // remove io.input from the list
          io.list.splice(io.i, 1);
          // insert at io.last_comprehension
          io.list.splice(i, 0, io.input)
          this.setupIO(io)
        }
      } else {
        io.last_comprehension = io.input
      }
      break
    case ezP.Consolidator.Arguments.Type.expression:
      if (io.first_keyword_or_star_star) {
        // there are at least 2 connected inputs
        // this one should not be there
        // it should be just before the first KW or **
        i = goog.array.indexOf(io.list, io.first_keyword_or_star_star)
        goog.asserts.assert(i < io.i, 'Internal inconsistency: '+i+ ' < '+io.i)
        io.last_expression = io.input
        io.list.splice(io.i, 1);
        io.list.splice(i, 0, io.input)
        this.setupIO(io)
        if (!io.last_positional || goog.array.indexOf(io.list, io.last_positional, i+2)<0) {
          io.last_positional = io.last_expression
        }
      } else {
        io.last_expression = io.last_positional = io.input
      }
      break
      case ezP.Consolidator.Arguments.Type.expression_star:
      if (io.first_star_star) {
        io.last_positional = io.input
        // there are at least 2 connected inputs
        // this one should not be there
        i = goog.array.indexOf(io.list, io.first_star_star)
        goog.asserts.assert(i < io.i, 'Internal inconsistency: '+i+ ' < '+io.i)
        io.list.splice(io.i, 1);
        io.list.splice(i, 0, io.input)
        this.setupIO(io)
      } else {
        io.last_positional = io.input
      }
    break
    case ezP.Consolidator.Arguments.Type.keyword_item:
      if (!io.first_keyword_or_star_star) {
        io.first_keyword_or_star_star = io.input
      }
    break
    case ezP.Consolidator.Arguments.Type.expression_star_star: 
      if (!io.first_keyword_or_star_star) {
        io.first_keyword_or_star_star = io.input
        io.first_star_star = io.input
      } else if (!io.first_star_star) {
        io.first_star_star = io.input
      }
      break
  }
}
/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.Arguments.prototype.cleanup = function(io) {
  ezP.Consolidator.Arguments.superClass_.cleanup.call(this, io)
  if (io.last_comprehension) {
    // there must be a unique input
    if (io.connected == 1) {
      // one of the normal situations
      // eventually remove separators after and before
      var i = goog.array.indexOf(io.list, io.last_comprehension)
      while (i + 1 < io.end) {
        this.disposeAtI(io, i + 1)
      }
      while (io.start < i--) {
        this.disposeAtI(io, io.start)
      }
      return
    }
    // there are too many connected blocks, mark the input as faulty
    io.n = 0
    io.i = io.start + 2
    while (this.nextInput(io)) {
      io.ezp.error_ = true
    }
  }
}

/**
 * Returns the required types for the current input.
 * @param {!Object} io parameter.
 */
ezP.Consolidator.Arguments.prototype.getCheck = function (io) {
  // is it a situation for comprehension ?
  // only one input or a replacement of the unique connected block
  if (io.connected <= 1 && (io.start + 1 == io.end || io.i == io.start+1)) {
    // console.log('Check: '+io.i+' -> any_argument_comprehensive')
    return ezP.T3.Expr.Check.any_argument_comprehensive
  }
  var can_star = !io.first_star_star || goog.array.indexOf(io.list, io.first_star_star, io.i) >= 0
  var can_expression = can_star && (!io.first_keyword_or_star_star || goog.array.indexOf(io.list, io.first_keyword_or_star_star, io.i) >= 0)
  var can_keyword = (!io.last_expression || goog.array.indexOf(io.list, io.last_expression) <= io.i)
  var can_star_star = (!io.last_positional || goog.array.indexOf(io.list, io.last_positional) <= io.i)
  if (can_expression) {
    if (can_star_star) {
      // everything, no need to check for starred or keywords
      // console.log('Check: '+io.i+' -> any_argument')
      return ezP.T3.Expr.Check.any_argument
    } else if (can_keyword) {
      // everything but double starred
      // console.log('Check: '+io.i+' -> any_argument_but_expression_star_star')
      return ezP.T3.Expr.Check.any_argument_but_expression_star_star
    } else {
      return ezP.T3.Expr.Check.positional_argument
    }
  } else if (can_star) {
    if (can_star_star) {
      // everything but expression
      // console.log('Check: '+io.i+' -> any_argument_but_expression')
      return ezP.T3.Expr.Check.any_argument_but_expression
    } else if (can_keyword) {
      // starred and keyword
      // console.log('Check: '+io.i+' -> any_argument_but_expression')
      return ezP.T3.Expr.Check.starred_and_keyword
    } else {
      // only starred
      return ezP.T3.Expr.expression_star
    }
  } else if (can_star_star) {
    if (can_keyword) {
      // double starred and keyword
      return ezP.T3.Expr.Check.keywords_argument
    } else {
      // only can_star_star
      return ezP.T3.Expr.expression_star_star
    }
  } else /* if (can_keyword) */ {
    // keyword only
    return ezP.T3.Expr.keyword_item
  }
}

/**
 * Class for a DelegateSvg, argument_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.argument_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.argument_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    consolidator: ezP.Consolidator.Arguments,
  }
  this.outputModel_.check = ezP.T3.Expr.argument_list
}
goog.inherits(ezP.DelegateSvg.Expr.argument_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('argument_list')


/**
 * Class for a DelegateSvg, starred_item_list_comprehensive block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.argument_list_comprehensive = function (prototypeName) {
  ezP.DelegateSvg.Expr.starred_item_list_comprehensive.superClass_.constructor.call(this, prototypeName)
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    single: ezP.T3.Expr.comprehension,
    consolidator: ezP.Consolidator.List.Singled,
    empty: true,
    sep: ',',
    hole_value: 'name',
  }
  var RA = goog.array.concat(D.check,D.single)
  goog.array.removeDuplicates(RA)
  D.all = RA
  this.inputModel_.list = D
  this.outputModel_.check = ezP.T3.Expr.starred_item_list_comprehensive
}
goog.inherits(ezP.DelegateSvg.Expr.starred_item_list_comprehensive, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('starred_item_list_comprehensive')
