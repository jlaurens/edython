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

goog.provide('ezP.DelegateSvg.Assignment')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')


/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('target_star', {
  inputs: {
    m_1: {
      key: ezP.Key.EXPRESSION,
      label: '*',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.target
    },
  },
})

/**
 * List consolidator for target list.
 * Rules are a bit stronger than python requires originally
 * 1) starred expression only at the end of the list
 * 2) only one such expression
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Target.Void = function(D) {
  var d = {}
  goog.mixin(d, ezP.Consolidator.List.Target.Void.data)
  goog.mixin(d, D)
  ezP.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(ezP.Consolidator.List.Target.Void, ezP.Consolidator.List.Target)

ezP.Consolidator.List.Target.Void.data = {
  hole_value: 'name',
  check: null,
  empty: true,
  sep: ',',
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
ezP.Consolidator.List.Target.prototype.getIO = function(block) {
  var io = ezP.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
ezP.Consolidator.List.Target.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the first_starred input
  var Type = {
    UNCONNECTED: 0,
    STARRED: 1,
    OTHER: 2,
  }
    /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function(io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (goog.array.contains(check, ezP.T3.Expr.target_star)) {
      return Type.STARRED
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      if ((io.ezp.parameter_type_ = getCheckType(io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.ezp.parameter_type_ === Type.OTHER) {
        io.last = io.i
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.List.Target.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // move parameters that are not placed correctly (in ezP sense)
    if (io.first_starred>=0) {
      while (io.first_starred < io.last) {
        this.setupIO(io, io.first_starred + 2)
        while (io.i <= io.last) {
          if (io.ezp.parameter_type_ === Type.OTHER) {
            // move this to io.first_starred
            var c8n = io.c8n
            var target = c8n.targetConnection
            c8n.disconnect()
            while (io.i > io.first_starred) {
              this.setupIO(io, io.i - 2)
              var t = io.c8n.targetConnection
              io.c8n.disconnect()
              c8n.connect(t)
              c8n = io.c8n
            }
            c8n.connect(target)
            io.first_starred += 2
            this.setupIO(io, io.first_starred + 2)
          } else {
            this.setupIO(io, io.i + 2)
          }
        }
        // io.last_positional = io.first_keyword - 2
        setupFirst.call(this, io)
      }
      // remove whatever is after the first_starred
      while (this.setupIO(io, io.first_starred + 1)) {
        this.disposeAtI(io)
      }
    }
  }
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.Target.prototype.getCheck = function (io) {
  if (io.first_starred < 0 || io.i === io.first_starred) {
    return ezP.T3.Expr.Check.target
  } else {
    return ezP.T3.Expr.Check.target_unstar
  }
}

/**
 * Class for a DelegateSvg, target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('target_list', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.List.Target,
      hole_value: 'name',
    },
  },
})

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('void_target_list', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.List.Target.Void,
      hole_value: 'name',
    },
  },
})

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('parenth_target_list', {
  inputs: {
    prefix: {
      label: '(',
    },
    suffix: {
      label: ')',
    }
  },
})

/**
 * Class for a DelegateSvg, bracket_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('bracket_target_list', {
  inputs: {
    prefix: {
      label: '[',
    },
    suffix: {
      label: ']',
    }
  },
})

/**
 * Class for a DelegateSvg, assignment_expression block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('assignment_expression', {
  inputs: {
    m_1: {
      key: ezP.Key.TARGET,
      wrap: ezP.T3.Expr.target_list,
    },
    m_3: {
      key: ezP.Key.ASSIGNED,
      operator: '=',
      wrap: ezP.T3.Expr.assigned_list,
    },
  },
})

goog.provide('ezP.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('assignment_stmt', {
  inputs: {
    insert: ezP.DelegateSvg.Expr.assignment_expression,
  }
})

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
ezP.Consolidator.Assigned = function() {
  ezP.Consolidator.Assigned.superClass_.constructor.call(this, ezP.Consolidator.Assigned.data)
}
goog.inherits(ezP.Consolidator.Assigned, ezP.Consolidator.List)

ezP.Consolidator.Assigned.data = {
  check: null,
  empty: false,
  sep: ',',
}

/**
 * Prepare io, just before walking through the input list for example.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.block} block owner of the receiver
 */
ezP.Consolidator.Assigned.prototype.getIO = function(block) {
  var io = ezP.Consolidator.Assigned.superClass_.getIO.call(this, block)
  io.first_single = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.Assigned.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the key inputs
  var Type = {
    unconnected: 0,
    single: 1,
    other: 2,
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
    if (goog.array.contains(check, ezP.T3.Expr.yield_expression)
    || goog.array.contains(check, ezP.T3.Expr.yield_expression_list)
      || goog.array.contains(check, ezP.T3.Expr.yield_from_expression)
        || goog.array.contains(check, ezP.T3.Expr.assignment_expression)) {
      return Type.first_single
    } else {
      return Type.other
    }
  }
  var setupFirst = function (io) {
    io.first_single = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      if(Type.first_single === (io.ezp.parameter_type_ = getCheckType(io))) {
        if (io.first_single < 0) {
          io.first_single = io.i
          return
        }
      }                    
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.Assigned.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // there must be an only one
    // first remove all the extra parameters
    if (io.first_single >= 0) {
      this.setupIO(io, 0)
      while(io.first_single>0) {
        this.disposeAtI(io)
        --io.first_single
      }
      this.setupIO(io, 1)
      while (io.list.length>1) {
        this.disposeAtI(io)
      }
    }
  }
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.Assigned.prototype.getCheck = function (io) {
  if (io.first_single >= 0 || (io.list.length === 1) || (io.i === 1 && io.list.length === 3)) {
    return ezP.T3.Expr.Check.assigned_list
  } else {
    return ezP.T3.Expr.Check.starred_item_list
  }
}

/**
 * Class for a DelegateSvg, assigned_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('assigned_list', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.Assigned,
      hole_value: 'value',
    },
  },
})

goog.provide('ezP.DelegateSvg.AugAssign')

/**
 * Class for a DelegateSvg, augassign_... block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.AugAssign = function (prototypeName) {
  ezP.DelegateSvg.AugAssign.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.AugAssign, ezP.DelegateSvg.Binary)

ezP.DelegateSvg.AugAssign.model__ = {
  inputs: {
    m_1: {
      check: ezP.T3.Expr.Check.augtarget,
    },
    m_3: {
      key: ezP.Key.EXPRESSION,
      wrap: ezP.T3.Expr.augassign_list_concrete,
    }
  }
}

/**
 * Class for a DelegateSvg, augassign_numeric block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('augassign_numeric', {
  inputs: {
    operators: ['+=','-=','*=','/=','//=','%=','**=','@='],
    m_3: {
      operator: '+=',
    },
  }
}, ezP.DelegateSvg.AugAssign)

/**
 * Class for a DelegateSvg, augassign_bitwise block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('augassign_bitwise', {
  inputs: {
    operators: [">>=", "<<=", "&=", "^=", "|="],
    m_3: {
      operator: '<<=',
    },
  }
}, ezP.DelegateSvg.AugAssign)

/**
 * Class for a DelegateSvg, augassign_numeric_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('augassign_numeric_stmt', {
  inputs: {
    insert: ezP.T3.Expr.augassign_numeric,
  },
})

/**
 * Class for a DelegateSvg, augassign_bitwise_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('augassign_bitwise_stmt', {
  inputs: {
    insert: ezP.T3.Expr.augassign_bitwise,
  },
})

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Stmt.augassign_numeric_stmt.prototype.getContent = ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.prototype.getContent = ezP.DelegateSvg.Binary.prototype.getContent

/**
 * List consolidator for target list.
 * Rules are a bit stronger than python requires originally
 * 1) starred expression only at the end of the list
 * 2) only one such expression
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.AugAssigned = function(D) {
  var d = {}
  goog.mixin(d, ezP.Consolidator.List.AugAssigned.data)
  goog.mixin(d, D)
  ezP.Consolidator.List.AugAssigned.superClass_.constructor.call(this, d)
}
goog.inherits(ezP.Consolidator.List.AugAssigned, ezP.Consolidator.List.Target)

ezP.Consolidator.List.AugAssigned.data = {
  hole_value: 'name',
  check: null,
  empty: false,
  sep: ',',
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
ezP.Consolidator.List.AugAssigned.prototype.getIO = function(block) {
  var io = ezP.Consolidator.List.AugAssigned.superClass_.getIO.call(this, block)
  io.first_yield = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
ezP.Consolidator.List.AugAssigned.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the first_starred input
  var Type = {
    UNCONNECTED: 0,
    YIELD: 1,
    OTHER: 2,
  }
    /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function(io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (goog.array.contains(check, ezP.T3.Expr.yield_expression_list) || goog.array.contains(check, ezP.T3.Expr.yield_from_expression)) {
      return Type.YIELD
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_yield = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      if ((io.ezp.parameter_type_ = getCheckType(io)) === Type.YIELD) {
        if (io.first_yield < 0) {
          io.first_yield = io.i
        }
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.List.AugAssigned.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // remove whatever is before or after the first yield block
    if (io.first_yield>=0) {
      while (io.first_yield--) {
        this.setupIO(io, 0)
        this.disposeAtI(io)
      }
      // remove whatever follows this block
      this.setupIO(io, 1)
      while (io.i < io.list.length) {
        this.disposeAtI(io)
      }
    }
  }
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.AugAssigned.prototype.getCheck = function (io) {
  if (io.list.length === 1 || io.list.length === 3 && io.i === 1) {
    return ezP.T3.Expr.Check.augassign_single
  } else {
    return ezP.T3.Expr.Check.expression
  }
}

/**
 * Class for a DelegateSvg, augassign_list_concrete.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('augassign_list_concrete', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.List.AugAssigned,
      hole_value: 'name',
    },
  }
})

ezP.DelegateSvg.AugAssign.populateContextMenuFirst_ = function (block, mgr) {
  var input = block.getInput(ezP.Key.LIST)
  if (input) {
    var target = input.connection.targetBlock()
    if (target) {
      var type
      var can_insert = function() {
        var e8r = target.ezp.inputEnumerator(target)
        while ((input = e8r.next())) {
          var c8n = e8r.here.connection
          if (c8n && !c8n.targetConnection) {
            if (goog.array.contains(c8n.check_, type)) {
              return true
            }
          }
        }
        return false
      }
      var F = function(content) {
        mgr.addInsertChild(new ezP.MenuItem(content, function() {
            Blockly.Events.setGroup(true)
            var BB = ezP.DelegateSvg.newBlockComplete(target.workspace, type)
            if (BB.ezp.setValue) {
              BB.ezp.setValue(BB, 'name')
            } else {
              var holes = ezP.HoleFiller.getDeepHoles(BB)
              ezP.HoleFiller.fillDeepHoles(BB.workspace, holes)
            }
            input.connection.connect(BB.outputConnection)
            target.ezp.consolidate(target)
            Blockly.Events.setGroup(false)
            return
          }))
      }
      type = ezP.T3.Expr.yield_expression_list
      if (can_insert()) {
        var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
          ezP.Do.createSPAN('yield', 'ezp-code-reserved'),
          ezP.Do.createSPAN(' …', 'ezp-code-placeholder'),
        )
        F(content)
      }
      type = ezP.T3.Expr.yield_from_expression
      if (can_insert()) {
        var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
          ezP.Do.createSPAN('yield from', 'ezp-code-reserved'),
          ezP.Do.createSPAN(' …', 'ezp-code-placeholder'),
        )
        F(content)
      }
      mgr.shouldSeparateInsert()
    }
  }
  return true
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.augassign_numeric.prototype.populateContextMenuFirst_ =
ezP.DelegateSvg.Expr.augassign_bitwise.prototype.populateContextMenuFirst_ = function(block, mgr) {
  ezP.DelegateSvg.AugAssign.populateContextMenuFirst_(block, mgr)
  return ezP.DelegateSvg.Expr.augassign_bitwise.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

ezP.DelegateSvg.Stmt.augassign_numeric_stmt.prototype.populateContextMenuFirst_ =
ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.prototype.populateContextMenuFirst_ = function(block, mgr) {
  mgr.populateOperator(block)
  ezP.DelegateSvg.AugAssign.populateContextMenuFirst_(block, mgr)
  return ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Get the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return None
 */
ezP.DelegateSvg.Stmt.augassign_numeric_stmt.prototype.getSubtype = ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.prototype.getSubtype = ezP.DelegateSvg.Operator.prototype.getSubtype

/**
 * Set the subtype of the block.
 * The operator.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Stmt.augassign_numeric_stmt.prototype.setSubtype = ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.prototype.setSubtype = ezP.DelegateSvg.Operator.prototype.setSubtype


ezP.DelegateSvg.Assignment.T3s = [
  ezP.T3.Expr.target_star,
  ezP.T3.Expr.target_list,
  ezP.T3.Expr.void_target_list,
  ezP.T3.Expr.parenth_target_list,
  ezP.T3.Expr.bracket_target_list,
  ezP.T3.Expr.assignment_expression,
  ezP.T3.Stmt.assignment_stmt,
  ezP.T3.Expr.assigned_list,
  ezP.T3.Expr.augassign_numeric,
  ezP.T3.Expr.augassign_bitwise,
  ezP.T3.Stmt.augassign_numeric_stmt,
  ezP.T3.Stmt.augassign_bitwise_stmt,
  ezP.T3.Expr.augassign_list_concrete,
]