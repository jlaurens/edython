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

eYo.require('expr.list')
eYo.require('expr.primary')

eYo.require('magnet')
goog.require('goog.dom');
eYo.provide('brick.lambda')
eYo.provide('brick.parameter')

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
//   eYo.Consolidator.Parameter.SuperProto_.constructor.Call(this, eYo.Consolidator.Parameter.data)
// }
// goog.require(eYo.Consolidator.list)
// goog.inherits(eYo.Consolidator.Parameter, eYo.Consolidator.list)

// eYo.Consolidator.Parameter.data = {
//   check: eYo.t3.Expr.Check.primary,
//   mandatory: 0,
//   presep: ',',
// }

eYo.Consolidator.list.makeSubclass('Parameter', {
  list: {
    check: null,
    mandatory: 0,
    presep: ','
  },
})
/**
 * Consolidate a connected input but the first one.
 * Does nothing if this is the last input of '**' type.
 * @param {Object} io parameter.
 * @return yes exactly if there are more input
 * @override
 */
eYo.Consolidator.Parameter.prototype.Consolidate_connected = function (io) {
  if (io.i + 1 === io.list.length) {
    var check = io.m4t.target.check_
    if (!check || goog.array.contains(check, eYo.t3.Expr.Parameter_star_star)) {
      // do not add a separator after
      return false
    }
  }
  return eYo.Consolidator.Parameter.SuperProto_.consolidate_connected.Call(this, io)
}

/**
 * Prepare io, just before walking through the input list for example.
 * Subclassers may add their own stuff to io.
 * @param {eYo.Brick.Dflt} brick owner of the receiver
 */
eYo.Consolidator.Parameter.prototype.getIO = function (brick) {
  var io = eYo.Consolidator.Parameter.SuperProto_.getIO.Call(this, brick)
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
   * Called when io.slot is connected.
   * @param {Object} io - parameters....
   */
  var getCheckType = io => {
    var target = io.m4t.target
    if (!target) {
      return Type.unconnected
    }
    var check = target.check_
    if (check) {
      if (goog.array.contains(check, eYo.t3.Expr.Star)) {
        return Type.star
      } else if (goog.array.contains(check, eYo.t3.Expr.Parameter_star)) {
        return Type.star
      } else if (goog.array.contains(check, eYo.t3.Expr.Parameter_star_star)) {
        return Type.star_star
      } else if (goog.array.contains(check, eYo.t3.Expr.identifier_valued)) {
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
    while (io.slot) {
      switch ((io.slot.parameter_type_ = getCheckType(io))) {
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
      this.nextSlot(io)
    }
  }
  return function (io) {
    eYo.Consolidator.Parameter.SuperProto_.doCleanup.Call(this, io)
    setupFirst.call(this, io)
    // there must be an only one
    // first remove all the extra ** parameters
    var i = io.first_star_star
    if (i >= 0 && i + 2 < io.list.length) {
      io.i = i + 2
      while (this.setupIO(io)) {
        if (io.slot.parameter_type_ === Type.star_star) {
          this.disposeAtI(io)
          this.disposeAtI(io)
        } else {
          io.i += 2
        }
      }
      if (io.i + 2 < io.list.length) {
        io.slot.edited = true
        this.setupIO(io, i)
        // move this parameter to the end of the list and hide a space
        // 1) disconnect the '**' from its input
        var m4t = io.m4t
        var targetM4t = m4t.target
        m4t.disconnect()
        while (true) {
          if (this.setupIO(io, io.i + 2)) {
            var nextM4t = io.m4t
            var nextTargetM4t = nextM4t.target
            nextM4t.disconnect()
            m4t.connect(nextTargetM4t)
            m4t = nextM4t
          } else {
            m4t.connect(targetM4t)
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
        if (io.slot.parameter_type_ === Type.star) {
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
      // we must move the '*' brick at io.last_default + 2
      io.slot.edited = true
      this.setupIO(io, io.first_star)
      m4t = io.m4t
      targetM4t = m4t.target
      m4t.disconnect()
      while (true) {
        this.setupIO(io, io.i - 2)
        nextM4t = io.m4t
        nextTargetM4t = m4t.target
        nextM4t.disconnect()
        m4t.connect(nextTargetM4t)
        m4t = nextM4t
        if (io.i <= io.last_default + 2) {
          m4t.connect(targetM4t)
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
 * @param {Object} io parameter.
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
      out = eYo.t3.Expr.Check.Parameter.Slice()
    }
    if (can_default) {
      out.push(eYo.t3.Expr.identifier_valued)
      out.push(eYo.t3.Expr.identifier_annotated_valued)
    }
    if (can_star) {
      out.push(eYo.t3.Expr.Star)
      out.push(eYo.t3.Expr.Parameter_star)
    }
    if (can_star_star) {
      out.push(eYo.t3.Expr.Parameter_star_star)
    }
    return (cache[K] = out)
  }
})()

/**
 * Class for a Delegate, parameter_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.list.makeSubclass('parameter_list', {
  list: {
    consolidator: eYo.Consolidator.Parameter
  }
})

/**
 * Populate the context menu for the given brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.expr.Parameter_list.prototype.populateContextMenuFirst_ = function (mngr) {
  var F = (modifier, flags, msg) => {
    var b3k
    eYo.events.disableWrap(() => {
      b3k = eYo.Brick.newReady(this, eYo.t3.Expr.identifier)
      b3k.change.wrap(() => {
        b3k.modifier_p = modifier
        b3k.variant_p = flags
      })
    })
    this.slotForEachReverse((slot) => {
      var m4t = slot.magnet
      if (m4t && !m4t.target) {
        if (m4t.checkType_(b3k.out_m)) {
          var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
            eYo.do.CreateSPAN('( ', 'eyo-code-disabled'),
            eYo.do.CreateSPAN(msg),
            eYo.do.CreateSPAN(' )', 'eyo-code-disabled')
          )
          mngr.addInsertChild(mngr.newMenuItem(
            content,
            () => {
              var b3k = eYo.Brick.newReady(this, eYo.t3.Expr.identifier)
              eYo.events.groupWrap(() => {
                b3k.change.wrap(() => {
                  b3k.modifier_p = modifier
                  b3k.variant_p = flags
                  m4t.connect(b3k.out_m)
                })
              })
            }
          ))
        }
      }
    })
    eYo.events.disableWrap(() => {
      b3k.dispose(true)
    })
  }
  F('', 0, 'name')
  F('', 1, 'name: expression')
  F('', 2, 'name = value')
  F('*', 4, '*')
  F('*', 0, '*…')
  F('**', 0, '**…')
  mngr.shouldSeparateInsert()
  eYo.expr.Parameter_list.SuperProto_.populateContextMenuFirst_.Call(this, mngr)
  return true
}

/**
 * Class for a Delegate, lambda_expr and lambda_expr_nocond brick.
 * The only difference between lambda_expr and lambda_expr_nocond comes
 * from the type of the expression. We choose to gather the two bricks
 * and just change the check array depending on the type of the connected
 * expression. Whenever one of the connections connects or disconnects,
 * the checking policy changes accordingly. See the `updateLambdaCheck`
 * method of the connection's delegate.
 * Not normally called directly, eYo.Brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.Dflt.makeSubclass('lambda', {
  slots: {
    parameters: {
      order: 1,
      fields: {
        label: 'lambda'
      },
      wrap: eYo.t3.Expr.Parameter_list
    },
    expression: {
      order: 3,
      fields: {
        label: ':'
      },
      check (type) /** @suppress {globalThis} */ {
        var m4t = this.brick.out_m.target
        if (m4t) {
          // does the target accept general expression in lambda
          if (m4t.check_ && m4t.check_.indexOf(eYo.t3.Expr.lambda_expr) < 0) {
            return eYo.t3.Expr.Check.expression_nocond
          }
        }
        return eYo.t3.Expr.Check.expression.Concat(eYo.t3.Expr.Check.expression_nocond)
      }
    }
  },
  out: {
    check (type) /** @suppress {globalThis} */ {
      var eyo = this.brick // does it always exist ?
      var m4tIn = eyo.expression_s.magnet
      var cond_in = true // cond are accepted by default
      var nocond_in = true // nocond are accepted by default
      var targetM4t = m4tIn.target
      if (targetM4t && targetM4t.check_) {
        cond_in = eYo.t3.Expr.Check.expression.Some(t => targetM4t.check_.indexOf(t) >= 0)
        nocond_in = eYo.t3.Expr.Check.expression_nocond.Some(t => targetM4t.check_.indexOf(t) >= 0)
      }
      return (cond_in ? [eYo.t3.Expr.lambda_expr] : []).concat(nocond_in ? [eYo.t3.Expr.lambda_expr_nocond] : [])
    }
  }
}, true)

;[
  // 'if',
  'lambda_expr',
  'lambda_expr_nocond'
].forEach(k => {
  eYo.C9r.register(k, (eYo.expr[k] = eYo.expr.lambda))
})

/**
 * The output check may change depending on the content.
 * For edython.
 */
eYo.Magnet.Dflt_p.ConsolidateType = function () {
  eYo.Magnet.SuperProto_.consolidateType.Call(this)
  var brick = this.brick
  var m4tOut = brick.out_m
  var slot = brick.getSlot(eYo.key.EXPRESSION)
  var m4tIn = slot.magnet
  var nocond_only_out = false
  var target = m4tOut.target
  if (target) {
    // does the target accept general expression in lambda
    nocond_only_out = target.check_ && (target.check_.indexOf(eYo.t3.Expr.lambda_expr)) < 0
  }
  var cond_in = true // cond are accepted by default
  var nocond_in = true // nocond not accepted by default
  target = m4tIn.target
  if (target) {
    cond_in = false
    for (var i = 0, t; (t = eYo.t3.Expr.Check.expression[++i]);) {
      if (!target.check_ || target.check_.indexOf(t) >= 0) {
        cond_in = true
        break
      }
    }
    nocond_in = false
    for (i = 0; (t = eYo.t3.Expr.Check.expression_nocond[++i]);) {
      if (!target.check_ || target.check_.indexOf(t) >= 0) {
        nocond_in = true
        break
      }
    }
  }
  // better design if we use the subtype ?
  m4tIn.check = nocond_only_out
    ? eYo.t3.Expr.Check.expression_nocond
    : eYo.t3.Expr.Check.expression.Concat(eYo.t3.Expr.Check.expression_nocond)
  m4tOut.check = 
    (cond_in ? [eYo.t3.Expr.lambda_expr] : []).concat(nocond_in ? [eYo.t3.Expr.lambda_expr_nocond] : [])
}

eYo.Brick.lambda.T3s = [
  eYo.t3.Expr.identifier,
  eYo.t3.Expr.Parameter_list,
  eYo.t3.Expr.lambda
]
