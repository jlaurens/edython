/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Lambda')


goog.provide('ezP.DelegateSvg.Parameter')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Term')

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
// ezP.Consolidator.Parameter = function() {
//   ezP.Consolidator.Parameter.superClass_.constructor.call(this, ezP.Consolidator.Parameter.data)
// }
// goog.inherits(ezP.Consolidator.Parameter, ezP.Consolidator.List)

// ezP.Consolidator.Parameter.data = {
//   check: ezP.T3.Expr.Check.primary,
//   empty: true,
//   presep: ',',
// }

ezP.Consolidator.List.makeSubclass('Parameter', {
  check: ezP.T3.Expr.Check.primary,
  empty: true,
  presep: ',',
}, ezP.Consolidator.List, ezP.Consolidator)
/**
 * Consolidate a connected input but the first one.
 * Does nothing if this is the last input of '**' type.
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 * @override
 */
ezP.Consolidator.Parameter.prototype.consolidate_connected = function(io) {
  if (io.i + 1 ===  io.list.length) {
    var check = io.c8n.targetConnection.check_
    if (goog.array.contains(check, ezP.T3.Expr.parameter_star_star)) {
      // do not add a separator after
      return false
    }
  }
  return ezP.Consolidator.Parameter.superClass_.consolidate_connected.call(this, io)
}

/**
 * Prepare io, just before walking through the input list for example.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.block} block owner of the receiver
 */
ezP.Consolidator.Parameter.prototype.getIO = function(block) {
  var io = ezP.Consolidator.Parameter.superClass_.getIO.call(this, block)
  io.first_star_star = io.first_star = io.first_default = io.last_default = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.Parameter.prototype.doCleanup = function () {
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
    } else if (goog.array.contains(check,ezP.T3.Expr.parameter_star)) {
      return Type.star
    } else if (goog.array.contains(check,ezP.T3.Expr.parameter_star_star)) {
      return Type.star_star
    } else if (goog.array.contains(check,ezP.T3.Expr.defparameter_solid)) {
      return Type.default
    } else {
      return Type.parameter
    }
  }
  var setupFirst = function (io) {
    io.first_star_star = io.min_first_star = io.first_star = io.first_default = io.last_default = -1
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
        if (io.first_star < 0) {
          io.min_first_star = io.i
        }
        break
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.Parameter.superClass_.doCleanup.call(this, io)
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
ezP.Consolidator.Parameter.prototype.getCheck = function() {
  var cache = {}
  return function (io) {
    var can_star_star = (io.first_star_star < 0 && io.i + 3  > io.list.length )
    || io.first_star_star == io.i
    var can_star = (io.first_star < 0 && io.min_first_star <= io.i && (io.last_default < 0 || io.i <= io.last_default + 2)) || io.first_star == io.i || io.list.length == 1
    var can_parameter = io.first_default < 0 || io.i <= io.first_default || io.first_star < 0 || io.i <= io.first_star
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
      out.push(ezP.T3.Expr.defparameter_solid)
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
ezP.DelegateSvg.List.makeSubclass('parameter_list', {
  list: {
    consolidator: ezP.Consolidator.Parameter,
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.parameter_list.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var e8r = block.ezp.inputEnumerator(block)
  var F = function(modifier, flags, msg) {
    var BB
    ezP.Events.Disabler.wrap(function() {
      BB = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.term, true)
      BB.ezp.skipRendering = true
      BB.ezp.data.modifier.set(modifier)
      BB.ezp.data.variant.set(flags)
    })
    e8r.end()
    while(e8r.previous()) {
      var c8n = e8r.here.connection
      if (c8n && !c8n.targetConnection) {
        if (c8n.checkType_(BB.outputConnection)) {
          var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
            ezP.Do.createSPAN('( ', 'ezp-code-disabled'),
            ezP.Do.createSPAN(msg),
            ezP.Do.createSPAN(' )', 'ezp-code-disabled'),
          )
          mgr.addInsertChild(new ezP.MenuItem(content, function() {
            var grouper = new ezP.Events.Grouper()
            try {
              var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.term, true)
              B.ezp.skipRendering = true
              B.ezp.data.modifier.set(modifier)
              B.ezp.data.variant.set(flags)
              B.ezp.skipRendering = false
              c8n.connect(B.outputConnection)
              B.render()
            } finally {
              grouper.stop()
            }
          }))
        }
      }
    }
    ezP.Events.Disabler.wrap(function() {
      BB.dispose(true)
    })
  }
  F('', 0, 'name')
  F('', 1, 'name: expression')
  F('', 2, 'name = value')
  F('*', 4, '*')
  F('*', 0, '*…')
  F('**', 0, '**…')
  mgr.shouldSeparateInsert()
  ezP.DelegateSvg.Expr.parameter_list.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

console.warn('Use a modifier field for * and ** (instead of await and async too)')

/**
 * Class for a DelegateSvg, lambda_expr and lambda_expr_nocond block.
 * The only difference between lambda_expr and lambda_expr_nocond comes
 * from the type of the expression. We choose to gather the two blocks
 * and just change the check array depending on the type of the connected
 * expression. Whenever one of the connections connects or disconnects,
 * the checking policy changes accordingly. See the `updateLambdaCheck`
 * method of the connection's delegate.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('lambda', {
  tiles: {
    parameters: {
      order: 1,
      label: 'lambda',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.parameter_list,
    },
    expression: {
      order: 3,
      label: ':',
      check: ezP.T3.Expr.Check.expression.concat(ezP.T3.Expr.Check.expression_nocond),
      didConnect: function(oldTargetConnection, oldConnectionn) {
        // `this` is a connection
        this.ezp.updateLambdaCheck()
      },
      didDisconnect: function(oldConnection) {
        // `this` is a connection
        this.ezp.updateLambdaCheck()
      },
    },
  },
  output: {
    check: [ezP.T3.Expr.lambda_expr, ezP.T3.Expr.lambda_expr_nocond],
    didConnect: function(oldTargetConnection, oldConnection) {
      this.ezp.consolidateSourceType()
    },
    didDisconnect: function(oldConnection) {
      this.ezp.consolidateSourceType()
    },
  },
})

ezP.ConnectionDelegate.prototype.consolidateType = function(block) {
  var c8nOut = block.outputConnection
  var input = block.getInput(ezP.Key.EXPRESSION)
  var c8nIn = input.connection
  var nocond_only_out = false
  var targetC8n = c8nOut.targetConnection
  if (targetC8n) {
    var nocond_only_out = targetC8n.check_.indexOf(ezP.T3.Expr.lambda_expr) < 0
  }
  var cond_in = true // cond are accepted by default
  var nocond_in = true // nocond not accepted by default
  targetC8n = c8nIn.targetConnection
  if (targetC8n) {
    cond_in = false
    for (var i = 0, t; (t = ezP.T3.Expr.Check.expression[++i]);) {
      if (targetC8n.check_.indexOf(t) >= 0) {
        cond_in = true
        break
      }
    }
    nocond_in = false
    for (var i = 0, t; (t = ezP.T3.Expr.Check.expression_nocond[++i]);) {
      if (targetC8n.check_.indexOf(t) >= 0) {
        nocond_in = true
        break
      }
    }
  }
  c8nIn.setCheck(nocond_only_out?
    ezP.T3.Expr.Check.expression_nocond:
    ezP.T3.Expr.Check.expression.concat(ezP.T3.Expr.Check.expression_nocond))
  c8nOut.setCheck(
    (cond_in?[ezP.T3.Expr.lambda_expr]: []).concat(nocond_in?[ezP.T3.Expr.lambda_expr_nocond]: [])
  )
}

ezP.DelegateSvg.Lambda.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.parameter_list,
  ezP.T3.Expr.lambda,
]

console.warn('no_cond not tested.')