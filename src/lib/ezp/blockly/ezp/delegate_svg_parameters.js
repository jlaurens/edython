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

goog.provide('ezP.DelegateSvg.Parameters')

goog.require('ezP.DelegateSvg.List')

/**
 * List consolidator for parameter list.
 * A parameter list contains 3 kinds of objects
 * 1) parameters as identifiers, (possibly annotated or defaulted)
 * 2) '*' identifier
 * 3) '**' identifier
 * Here are the rules
 * A) The starred identifiers must appear only once at most.
 * B) The single starred must appear before the double starred, if any
 * C) The double starred must be the last one if any
 * D) Citing the documentation:
 *    If a parameter has a default value,
 *    all following parameters up until the “*”
 *    must also have a default value...
 * All the inputs are connectedÒ.
 */
ezP.Consolidator.Parameters = function() {
  ezP.Consolidator.Parameters.superClass_.constructor.call(this, ezP.Consolidator.Parameters.data)
}
goog.inherits(ezP.Consolidator.Parameters, ezP.Consolidator.List)

ezP.Consolidator.Parameters.data = {
  check: ezP.T3.Expr.Check.primary,
  empty: true,
  sep: ',',
}

/**
 * Consolidate a connected input but the first one.
 * Does nothing if this is the last input of '**' type.
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 * @override
 */
ezP.Consolidator.Parameters.prototype.consolidate_connected = function(io) {
  if (io.i + 1 ===  io.list.length) {
    var check = io.c8n.targetConnection.check_
    if (goog.array.contains(check,ezP.T3.Expr.parameter_star_star)) {
      // do not add a separator after
      return false
    }
  }
  return ezP.Consolidator.Parameters.superClass_.consolidate_connected.call(this, io)
}

/**
 * Prepare io, just before walking through the input list for example.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.block} block owner of the receiver
 */
ezP.Consolidator.Parameters.prototype.getIO = function(block) {
  var io = ezP.Consolidator.Parameters.superClass_.getIO.call(this, block)
  io.first_star_star = io.first_star = io.first_default = io.last_default = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.Parameters.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the key inputs
  var Type = {
    unconnected: 0,
    parameter: 1,
    default: 2,
    star: 3,
    star_star: 4,
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function(io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.unconnected
    }
    var check = target.check_
    if (goog.array.contains(check,ezP.T3.Expr.parameter_star)) {
      return Type.star
    } else if (goog.array.contains(check,ezP.T3.Expr.parameter_star_star)) {
      return Type.star_star
    } else if (goog.array.contains(check,ezP.T3.Expr.defparameter_concrete)) {
      return Type.default
    } else {
      return Type.parameter
    }
  }
  var setupFirst = function (io) {
    io.first_star_star = io.first_star = io.first_default = io.last_default = -1
    var last_default = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      switch((io.ezp.parameter_type_ = getCheckType(io))) {
        case Type.star_star:
        if (io.first_star_star < 0) {
          io.first_star_star = io.i
        }
        break
        case Type.star:
        if (io.first_star < 0) {
          // this is an error
          io.first_star = io.i
        }
        break
        case Type.default:
        if (io.first_default < 0 && io.first_star < 0) {
          io.first_default = io.i
        }
        if (io.last_default < 0) {
          last_default = io.i
        }
        break
        case Type.parameter:
        if (io.last_default < 0) {
          io.last_default = last_default
        }
        break
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.Parameters.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // there must be an only one
    // first remove all the extra ** parameters
    var i = io.first_star_star
    if (i>=0 && i+2 < io.list.length) {
      io.i = i+2
      while (this.setupIO(io)) {
        if (io.ezp.parameter_type_ == Type.star_star) {
          this.disposeAtI(io)
          this.disposeAtI(io)
        } else {
          io.i += 2
        }
      }
      if (i+2 < io.list.length) {
        io.ezp.edited = true
        this.setupIO(io, i)
        // move this parameter to the end of the list and hide a space
        // 1) disconnect the '**' from its input
        var c8n = io.c8n
        var targetC8n = c8n.targetConnection
        c8n.disconnect()
        while (true) {
          if (this.setupIO(io, io.i + 2)) {
            var nextC8n = io.c8n
            var nextTargetC8n = c8n.targetConnection
            nextC8n.disconnect()
            c8n.connect(nextTargetC8n)
            c8n = nextC8n
          } else {
            c8n.connect(targetC8n)
            break
          }
        }
      }
      setupFirst.call(this)
    }
    if (io.first_star_star >= 0) {
      i = io.first_star_star + 1
      if (i < io.list.length) {
        this.disposeAtI(io, i)
      }
    }
  // Now remove any extra * parameter
    i = io.list.indexOf(io.first_star)
    if (i>=0) {
      io.i = i+2
      while (this.setupIO(io)) {
        if (io.ezp.parameter_type_ === Type.star) {
          this.disposeAtI(io)
          this.disposeAtI(io)
        } else {
          io.i += 2
        }
      }
      setupFirst.call(this)
    }
    // now move the '*' input
    if (io.last_default >= 0 && io.last_default + 4 <= io.first_star) {
      // it means that io.last_default + 2 is a no default parameter
      // we must move the '*' block at io.last_default + 2
      io.ezp.edited = true
      this.setupIO(io, io.first_star)
      var c8n = io.c8n
      var targetC8n = c8n.targetConnection
      c8n.disconnect()
      while (true) {
        this.setupIO(io, io.i - 2)
        var nextC8n = io.c8n
        var nextTargetC8n = c8n.targetConnection
        nextC8n.disconnect()
        c8n.connect(nextTargetC8n)
        c8n = nextC8n
        if (io.i <= io.last_default + 2) {
          c8n.connect(targetC8n)
          break
        }
      }
      setupFirst.call(this)
    }
  }
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.Parameters.prototype.getCheck = function() {
  var cache = {}
  return function (io) {
    var can_star_star = (io.first_star_star < 0 && io.i + 3  > io.list.length )
    || io.first_star_star == io.i
    var can_star = (io.first_star < 0 && (io.last_default < 0 || io.i <= io.last_default + 2)) || io.first_star == io.i
    var can_parameter = io.first_default < 0 || io.i <= io.first_default || io.first_star < 0 || io.i >= io.first_star
    var can_default = io.first_star < 0 || io.i > io.first_star - 3 || (io.last_default < 0 && io.last_default - 2 < io.i)
    var K = 0
    if (can_parameter) {
      K += 1
    }
    if (can_default) {
      K += 2
    }
    if (can_star) {
      K += 4
    }
    if (can_star_star) {
      K += 8
    }
    var out = cache[K]
    if (out) {
      return out
    }
    out = []
    if (can_parameter) {
      out = ezP.T3.Expr.Check.parameter.slice()
    }
    if (can_default) {
      out.push(ezP.T3.Expr.defparameter_concrete)
    }
    if (can_star) {
      out.push(ezP.T3.Expr.parameter_star)      
    }
    if (can_star_star) {
      out.push(ezP.T3.Expr.parameter_star_star)      
    }
    return cache[K] = out
  }
} ()

/**
 * Class for a DelegateSvg, parameter_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parameter_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.parameter_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    consolidator: ezP.Consolidator.Parameters,
  }
  this.outputModel_.check = ezP.T3.Expr.parameter_list
}
goog.inherits(ezP.DelegateSvg.Expr.parameter_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('parameter_list')

/**
 * Class for a DelegateSvg, parameter_star.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parameter_star = function (prototypeName) {
  ezP.DelegateSvg.Expr.parameter_star.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Const.Input.NAME,
    label: '*',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.parameter,
    hole_value: 'name',
    optional: true,
  }
  this.outputModel_.check = ezP.T3.Expr.parameter_star
}
goog.inherits(ezP.DelegateSvg.Expr.parameter_star, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('parameter_star')

/**
 * Class for a DelegateSvg, parameter_star_star.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parameter_star_star = function (prototypeName) {
  ezP.DelegateSvg.Expr.parameter_star_star.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Const.Input.NAME,
    label: '**',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.parameter,
    hole_value: 'name',
  }
  this.outputModel_.check = ezP.T3.Expr.parameter_star_star
}
goog.inherits(ezP.DelegateSvg.Expr.parameter_star_star, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('parameter_star_star')

/**
 * Class for a DelegateSvg, parameter_concrete.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parameter_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.parameter_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Const.Input.NAME,
    check: ezP.T3.Expr.identifier,
    hole_value: 'name',
  }
  this.inputModel_.last = {
    key: ezP.Const.Input.EXPR,
    label: ':',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
  }
  this.outputModel_.check = ezP.T3.Expr.parameter_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.parameter_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('parameter_concrete')

/**
 * Class for a DelegateSvg, defparameter_concrete.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.defparameter_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.defparameter_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Const.Input.NAME,
    check: ezP.T3.Expr.Check.parameter,
    hole_value: 'name',
  }
  this.inputModel_.last = {
    key: ezP.Const.Input.EXPR,
    label: '=',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.expression,
  }
  this.outputModel_.check = ezP.T3.Expr.defparameter_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.defparameter_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('defparameter_concrete')
