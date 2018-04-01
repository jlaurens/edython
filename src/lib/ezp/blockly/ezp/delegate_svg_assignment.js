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

goog.provide('ezP.DelegateSvg.Expr.Target')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')


/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.target_star = function (prototypeName) {
  ezP.DelegateSvg.Expr.target_star.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    label: '*',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.target
  }
  this.outputModel_.check = ezP.T3.Expr.target_star
}
goog.inherits(ezP.DelegateSvg.Expr.target_star, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('target_star')

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
ezP.DelegateSvg.Expr.target_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.target_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    consolidator: ezP.Consolidator.List.Target,
    hole_value: 'name',
  }
  this.outputModel_.check = ezP.T3.Expr.target_list
}
goog.inherits(ezP.DelegateSvg.Expr.target_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('target_list')

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.void_target_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.void_target_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    consolidator: ezP.Consolidator.List.Target.Void,
  }
  this.outputModel_.check = ezP.T3.Expr.void_target_list
}
goog.inherits(ezP.DelegateSvg.Expr.void_target_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('void_target_list')

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parenth_target_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.parenth_target_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    start: '(',
    end: ')',
    wrap: ezP.T3.Expr.void_target_list,
  }
  this.outputModel_.check = ezP.T3.Expr.parenth_target_list
}
goog.inherits(ezP.DelegateSvg.Expr.parenth_target_list, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('parenth_target_list')

/**
 * Class for a DelegateSvg, bracket_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.bracket_target_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.bracket_target_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    start: '[',
    end: ']',
    wrap: ezP.T3.Expr.void_target_list,
  }
  this.outputModel_.check = ezP.T3.Expr.bracket_target_list
}
goog.inherits(ezP.DelegateSvg.Expr.bracket_target_list, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('bracket_target_list')

/**
 * Class for a DelegateSvg, assignment_expression block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.assignment_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.assignment_expression.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      key: ezP.Key.LHS,
      wrap: ezP.T3.Expr.target_list,
    },
    last: {
      key: ezP.Key.RHS,
      operator: '=',
      wrap: ezP.T3.Expr.assigned_list,
    },
  }
  this.outputModel_.check = ezP.T3.Expr.assignment_expression
}
goog.inherits(ezP.DelegateSvg.Expr.assignment_expression, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('assignment_expression')

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.assignment_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.assignment_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.last = {
    key: ezP.Key.EXPRESSION,
    wrap: ezP.T3.Expr.assignment_expression,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.assignment_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('assignment_stmt')

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
ezP.DelegateSvg.Expr.assigned_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.assigned_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    consolidator: ezP.Consolidator.Assigned,
    hole_value: 'value',
  }
  this.outputModel_.check = ezP.T3.Expr.assigned_list
}
goog.inherits(ezP.DelegateSvg.Expr.assigned_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('assigned_list')

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
  this.inputModel_.first.check = ezP.T3.Expr.Check.augtarget
  this.inputModel_.last.key = ezP.Key.LIST
  this.inputModel_.last.wrap = ezP.T3.Expr.augassign_list
}

goog.inherits(ezP.DelegateSvg.AugAssign, ezP.DelegateSvg.Binary)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.AugAssign.prototype.XpopulateContextMenuFirst_ = function (block, mgr) {
  var yorn
  var target = this.model.last.input.connection.targetBlock()
  if (target) {
    var D = ezP.DelegateSvg.Manager.getInputModel(target.type)
    if (yorn = mgr.populate_wrap_alternate(target, D.last.key)) {
      mgr.shouldSeparate()
    }
  }
  return ezP.DelegateSvg.AugAssign.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, augassign_numeric block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.augassign_numeric = function (prototypeName) {
  ezP.DelegateSvg.Expr.augassign_numeric.superClass_.constructor.call(this, prototypeName)
  this.operators = ['+=','-=','*=','/=','//=','%=','**=','@=']
  this.inputModel_.last.operator = this.operators[0]
  this.outputModel_.check = ezP.T3.Expr.augassign_numeric
}

goog.inherits(ezP.DelegateSvg.Expr.augassign_numeric, ezP.DelegateSvg.AugAssign)
ezP.DelegateSvg.Manager.register('augassign_numeric')

/**
 * Class for a DelegateSvg, augassign_bitwise block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.augassign_bitwise = function (prototypeName) {
  ezP.DelegateSvg.Expr.augassign_bitwise.superClass_.constructor.call(this, prototypeName)
  this.operators = [">>=", "<<=", "&=", "^=", "|="]
  this.inputModel_.last.operator = this.operators[1]
  this.outputModel_.check = ezP.T3.Expr.augassign_bitwise
}

goog.inherits(ezP.DelegateSvg.Expr.augassign_bitwise, ezP.DelegateSvg.AugAssign)
ezP.DelegateSvg.Manager.register('augassign_bitwise')

/**
 * Class for a DelegateSvg, augassign_numeric_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.augassign_numeric_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.augassign_numeric_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.last = {
    key: ezP.Key.EXPRESSION,
    wrap: ezP.T3.Expr.augassign_numeric,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.augassign_numeric_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('augassign_numeric_stmt')

/**
 * Class for a DelegateSvg, augassign_bitwise_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.augassign_bitwise_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.last = {
    key: ezP.Key.EXPRESSION,
    wrap: ezP.T3.Expr.augassign_bitwise,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.augassign_bitwise_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('augassign_bitwise_stmt')

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
    return ezP.T3.Expr.Check.augassign_content
  } else {
    return ezP.T3.Expr.Check.expression
  }
}

/**
 * Class for a DelegateSvg, augassign_list.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.augassign_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.augassign_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    consolidator: ezP.Consolidator.List.AugAssigned,
  }
  this.outputModel_.check = ezP.T3.Expr.augassign_list
}
goog.inherits(ezP.DelegateSvg.Expr.augassign_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('augassign_list')


ezP.ID.ASSIGN_LIST_INSERT = 'ASSIGN_LIST_INSERT'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.augassign_numeric.prototype.populateContextMenuFirst_ =
ezP.DelegateSvg.Expr.augassign_bitwise.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var target = this.model.last.input.connection.targetBlock()
  if (target) {
    var type, input
    var can_insert = function() {
      for (var i =0; (input = target.inputList[i++]);) {
        var c8n = input.connection
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
  return ezP.DelegateSvg.Expr.augassign_numeric.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.augassign_numeric.prototype.handleMenuItemActionFirst = ezP.DelegateSvg.Expr.augassign_bitwise.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  var model = event.target.getModel()
  if (model.action === ezP.ID.ASSIGN_LIST_INSERT) {
    Blockly.Events.setGroup(true)
    var input = model.target
    var BB = ezP.DelegateSvg.newBlockComplete(block.workspace, model.type)
    if (BB.ezp.setValue) {
      BB.ezp.setValue(BB, 'name')
    } else {
      var holes = ezP.HoleFiller.getDeepHoles(BB)
      ezP.HoleFiller.fillDeepHoles(BB.workspace, holes)
    }
    input.connection.connect(BB.outputConnection)
    input.sourceBlock_.ezp.consolidate(input.sourceBlock_)
    Blockly.Events.setGroup(false)
    return true
  }
  return ezP.DelegateSvg.Stmt.augassign_numeric_stmt.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}

