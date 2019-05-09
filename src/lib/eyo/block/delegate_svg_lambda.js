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

goog.provide('eYo.DelegateSvg.Lambda')
goog.provide('eYo.DelegateSvg.Parameter')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.Magnet')
goog.require('goog.dom');

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
// eYo.Consolidator.Parameter = function() {
//   eYo.Consolidator.Parameter.superClass_.constructor.call(this, eYo.Consolidator.Parameter.data)
// }
// goog.inherits(eYo.Consolidator.Parameter, eYo.Consolidator.List)

// eYo.Consolidator.Parameter.data = {
//   check: eYo.T3.Expr.Check.primary,
//   mandatory: 0,
//   presep: ',',
// }

eYo.Consolidator.List.makeSubclass('Parameter', {
  check: null,
  mandatory: 0,
  presep: ','
}, eYo.Consolidator.List, eYo.Consolidator)
/**
 * Consolidate a connected input but the first one.
 * Does nothing if this is the last input of '**' type.
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 * @override
 */
eYo.Consolidator.Parameter.prototype.consolidate_connected = function (io) {
  if (io.i + 1 === io.list.length) {
    var check = io.c8n.targetConnection.check_
    if (!check || goog.array.contains(check, eYo.T3.Expr.parameter_star_star)) {
      // do not add a separator after
      return false
    }
  }
  return eYo.Consolidator.Parameter.superClass_.consolidate_connected.call(this, io)
}

/**
 * Prepare io, just before walking through the input list for example.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block owner of the receiver
 */
eYo.Consolidator.Parameter.prototype.getIO = function (block) {
  var io = eYo.Consolidator.Parameter.superClass_.getIO.call(this, block)
  io.first_star_star = io.first_star = io.first_default = io.last_default = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
eYo.Consolidator.Parameter.prototype.doCleanup = (() => {
  // preparation: walk through the list of inputs and
  // find the key inputs
  var Type = {
    unconnected: 0,
    parameter: 1,
    init: 2,
    star: 3,
    star_star: 4
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = io => {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.unconnected
    }
    var check = target.check_
    if (check) {
      if (goog.array.contains(check, eYo.T3.Expr.star)) {
        return Type.star
      } else if (goog.array.contains(check, eYo.T3.Expr.parameter_star)) {
        return Type.star
      } else if (goog.array.contains(check, eYo.T3.Expr.parameter_star_star)) {
        return Type.star_star
      } else if (goog.array.contains(check, eYo.T3.Expr.identifier_valued)) {
        return Type.default
      } else {
        return Type.parameter
      }
    } else {
      return Type.parameter
    }
  }
  var setupFirst = function (io) {
    io.first_star_star = io.min_first_star = io.first_star = io.first_default = io.last_default = -1
    var last_default = -1
    this.setupIO(io, 0)
    while (io.eyo) {
      switch ((io.eyo.parameter_type_ = getCheckType(io))) {
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
  return function (io) {
    eYo.Consolidator.Parameter.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // there must be an only one
    // first remove all the extra ** parameters
    var i = io.first_star_star
    if (i >= 0 && i + 2 < io.list.length) {
      io.i = i + 2
      while (this.setupIO(io)) {
        if (io.eyo.parameter_type_ === Type.star_star) {
          this.disposeAtI(io)
          this.disposeAtI(io)
        } else {
          io.i += 2
        }
      }
      if (i + 2 < io.list.length) {
        io.eyo.edited = true
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
    if (i >= 0) {
      io.i = i + 2
      while (this.setupIO(io)) {
        if (io.eyo.parameter_type_ === Type.star) {
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
      io.eyo.edited = true
      this.setupIO(io, io.first_star)
      c8n = io.c8n
      targetC8n = c8n.targetConnection
      c8n.disconnect()
      while (true) {
        this.setupIO(io, io.i - 2)
        nextC8n = io.c8n
        nextTargetC8n = c8n.targetConnection
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
})()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
eYo.Consolidator.Parameter.prototype.getCheck = (() => {
  var cache = {}
  return function (io) {
    var can_star_star = (io.first_star_star < 0 && io.i + 3 > io.list.length) ||
    io.first_star_star === io.i
    var can_star = (io.first_star < 0 && io.min_first_star <= io.i && (io.last_default < 0 || io.i <= io.last_default + 2)) || io.first_star === io.i || io.list.length === 1
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
      out = eYo.T3.Expr.Check.parameter.slice()
    }
    if (can_default) {
      out.push(eYo.T3.Expr.identifier_valued)
      out.push(eYo.T3.Expr.identifier_annotated_valued)
    }
    if (can_star) {
      out.push(eYo.T3.Expr.star)
      out.push(eYo.T3.Expr.parameter_star)
    }
    if (can_star_star) {
      out.push(eYo.T3.Expr.parameter_star_star)
    }
    return (cache[K] = out)
  }
})()

/**
 * Class for a DelegateSvg, parameter_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('parameter_list', {
  list: {
    consolidator: eYo.Consolidator.Parameter
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.parameter_list.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var ws = this.workspace
  var e8r = this.inputEnumerator()
  var F = (modifier, flags, msg) => {
    var y
    eYo.Events.disableWrap(() => {
      y = eYo.DelegateSvg.newComplete(this, eYo.T3.Expr.identifier)
      y.changeWrap(
        function() { // `this` is `y`
          this.modifier_p = modifier
          this.variant_p = flags
        }
      )
    })
    e8r.end()
    while (e8r.previous()) {
      var m4t = e8r.here.eyo.magnet
      if (m4t && !m4t.target) {
        if (m4t.checkType_(y.magnets.output)) {
          var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
            eYo.Do.createSPAN('( ', 'eyo-code-disabled'),
            eYo.Do.createSPAN(msg),
            eYo.Do.createSPAN(' )', 'eyo-code-disabled')
          )
          mgr.addInsertChild(mgr.newMenuItem(
            content,
            () => {
              var y = eYo.DelegateSvg.newComplete(this, eYo.T3.Expr.identifier)
              eYo.Events.groupWrap(
                () => { // `this` is catched
                  y.changeWrap(
                    function () { // `this` is `y`
                      this.modifier_p = modifier
                      this.variant_p = flags
                      m4t.connect(y.magnets.output)    
                    }
                  )
                }
              )
            }
          ))
        }
      }
    }
    eYo.Events.disableWrap(() => {
      y.block_.dispose(true)
    })
  }
  F('', 0, 'name')
  F('', 1, 'name: expression')
  F('', 2, 'name = value')
  F('*', 4, '*')
  F('*', 0, '*…')
  F('**', 0, '**…')
  mgr.shouldSeparateInsert()
  eYo.DelegateSvg.Expr.parameter_list.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

/**
 * Class for a DelegateSvg, lambda_expr and lambda_expr_nocond block.
 * The only difference between lambda_expr and lambda_expr_nocond comes
 * from the type of the expression. We choose to gather the two blocks
 * and just change the check array depending on the type of the connected
 * expression. Whenever one of the connections connects or disconnects,
 * the checking policy changes accordingly. See the `updateLambdaCheck`
 * method of the connection's delegate.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('lambda', {
  slots: {
    parameters: {
      order: 1,
      fields: {
        label: 'lambda'
      },
      wrap: eYo.T3.Expr.parameter_list
    },
    expression: {
      order: 3,
      fields: {
        label: ':'
      },
      check: /** @suppress {globalThis} */ function (type) {
        var m4t = this.b_eyo.magnets.output.target
        if (m4t) {
          // does the target accept general expression in lambda
          if (m4t.check_ && m4t.check_.indexOf(eYo.T3.Expr.lambda_expr) < 0) {
            return eYo.T3.Expr.Check.expression_nocond
          } 
        }
        return eYo.T3.Expr.Check.expression.concat(eYo.T3.Expr.Check.expression_nocond)     
      }
    }
  },
  output: {
    check: /** @suppress {globalThis} */ function (type) {
      var eyo = this.b_eyo // does it always exist ?
      var c8nIn = eyo.expression_s.connection
      var cond_in = true // cond are accepted by default
      var nocond_in = true // nocond are accepted by default
      var targetC8n = c8nIn.targetConnection
      if (targetC8n && targetC8n.check_) {
        cond_in = eYo.T3.Expr.Check.expression.some(t => targetC8n.check_.indexOf(t) >= 0)
        nocond_in = eYo.T3.Expr.Check.expression_nocond.some(t => targetC8n.check_.indexOf(t) >= 0)
      }
      return (cond_in ? [eYo.T3.Expr.lambda_expr] : []).concat(nocond_in ? [eYo.T3.Expr.lambda_expr_nocond] : [])
    }
  }
}, true)

var names = [
  // 'if',
  'lambda_expr',
  'lambda_expr_nocond'
]
names.forEach((key) => {
  eYo.DelegateSvg.Expr[key] = eYo.DelegateSvg.Expr.lambda
  eYo.DelegateSvg.Manager.register(key)
})

/**
 * The output check may change depending on the content.
 * For edython.
 */
eYo.Magnet.prototype.consolidateType = function () {
  eYo.Magnet.superClass_.consolidateType.call(this)
  var b_eyo = this.b_eyo
  var m4tOut = b_eyo.magnets.output
  var input = b_eyo.getInput(eYo.Key.EXPRESSION)
  var m4tIn = input.eyo.magnet
  var nocond_only_out = false
  var target = m4tOut.target
  if (target) {
    // does the target accept general expression in lambda
    nocond_only_out = target.check_ && target.check_.indexOf(eYo.T3.Expr.lambda_expr) < 0
  }
  var cond_in = true // cond are accepted by default
  var nocond_in = true // nocond not accepted by default
  target = m4tIn.target
  if (target) {
    cond_in = false
    for (var i = 0, t; (t = eYo.T3.Expr.Check.expression[++i]);) {
      if (!target.check_ || target.check_.indexOf(t) >= 0) {
        cond_in = true
        break
      }
    }
    nocond_in = false
    for (i = 0; (t = eYo.T3.Expr.Check.expression_nocond[++i]);) {
      if (!target.check_ || target.check_.indexOf(t) >= 0) {
        nocond_in = true
        break
      }
    }
  }
  // better design if we use the subtype ?
  m4tIn.setCheck(nocond_only_out
    ? eYo.T3.Expr.Check.expression_nocond
    : eYo.T3.Expr.Check.expression.concat(eYo.T3.Expr.Check.expression_nocond))
  m4tOut.setCheck(
    (cond_in ? [eYo.T3.Expr.lambda_expr] : []).concat(nocond_in ? [eYo.T3.Expr.lambda_expr_nocond] : [])
  )
}

eYo.DelegateSvg.Lambda.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.parameter_list,
  eYo.T3.Expr.lambda
]
