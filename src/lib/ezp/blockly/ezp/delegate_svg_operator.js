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

goog.provide('ezP.DelegateSvg.Operator')
goog.provide('ezP.MixinSvg.Operator')

goog.require('ezP.DelegateSvg.Expr')

// Declare the mixins first

/**
 * Inits the various input data.
 * Called by the constructor.
 * Separated to be mixed in.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.MixinSvg.Operator.initData = function (prototypeName) {
  this.inputData_ = {
    last: {
      key: ezP.Const.Input.RHS,
      css_class: 'ezp-code',
      hole_value: 'name',
    },
  }
}

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.MixinSvg.Operator.toDom = function (block, element) {
  element.setAttribute('operator', this.inputs.last.fieldLabel.getText())
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.MixinSvg.Operator.fromDom = function (block, element) {
  var op = element.getAttribute('operator')
  if (this.operators && this.operators.indexOf(op) >= 0) {
    this.inputs.last.fieldLabel.setValue(op)
  }
}

/**
 * Class for a DelegateSvg, [...] op ... block.
 * Multiple ops.
 * Abstract class.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Operator = function (prototypeName) {
  ezP.DelegateSvg.Operator.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Operator, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Operator.prototype.operators = undefined

ezP.MixinSvg(ezP.DelegateSvg.Operator, 'Operator')

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Operator.prototype.getContent = /* function (block, op) {
} */ undefined

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Operator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = mgr.populateOperator(block)
  return ezP.DelegateSvg.Operator.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!ezP.MenuManager} mgr mgr.menu is the Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Operator.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  
  return mgr.handleActionOperator(block, event) || ezP.DelegateSvg.Operator.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}

//////////////////////  u_expr_concrete  /////////////////////////

/**
 * Class for a DelegateSvg, unary op ... block.
 * u_expr_concrete.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.u_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.u_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputData_.check = ezP.T3.Expr.u_expr_concrete
  this.operators = ['-', '+', '~']
  goog.mixin(this.inputData_.last, {
    label: this.operators[0],
    check: ezP.T3.Expr.Check.u_expr
  })
}
goog.inherits(ezP.DelegateSvg.Expr.u_expr_concrete, ezP.DelegateSvg.Operator)
ezP.DelegateSvg.Manager.register('u_expr_concrete')

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.u_expr_concrete.prototype.getContent = function (block, op) {
  return op+' ...'
}

/**
 * Class for a DelegateSvg, ... op ... block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Binary = function (prototypeName) {
  ezP.DelegateSvg.Binary.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first = {
    key: ezP.Const.Input.LHS,
    hole_value: 'name',
  }
}
goog.inherits(ezP.DelegateSvg.Binary, ezP.DelegateSvg.Operator)

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Binary.prototype.getContent = function (block, op) {
  return '... '+ op +' ...'
}

/**
 * Class for a DelegateSvg, m_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.m_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.m_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['*', '//', '/', '%', '@']
  this.inputData_.first.check = ezP.T3.Expr.Check.m_expr
  this.inputData_.last.label = '*'
  this.inputData_.last.check = ezP.T3.Expr.Check.u_expr
  this.outputData_.check = ezP.T3.Expr.m_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.m_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('m_expr_concrete')

/**
 * Class for a DelegateSvg, a_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.a_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.a_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['+', '-']
  this.inputData_.first.check = ezP.T3.Expr.Check.a_expr
  this.inputData_.last.label = '+'
  this.inputData_.last.check = ezP.T3.Expr.Check.m_expr
  this.outputData_.check = ezP.T3.Expr.a_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.a_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('a_expr_concrete')

/**
 * Class for a DelegateSvg, shift_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.shift_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.shift_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.operators = ['<<', '>>']
  this.inputData_.first.check = ezP.T3.Expr.Check.shift_expr
  this.inputData_.last.label = '<<'
  this.inputData_.last.check = ezP.T3.Expr.Check.a_expr
  this.outputData_.check = ezP.T3.Expr.shift_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.shift_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('shift_expr_concrete')

/**
 * Class for a DelegateSvg, and_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.and_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.and_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first.check = ezP.T3.Expr.Check.and_expr
  this.inputData_.last.label = '&'
  this.inputData_.last.check = ezP.T3.Expr.Check.shift_expr
  this.outputData_.check = ezP.T3.Expr.and_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.and_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('and_expr_concrete')

/**
 * Class for a DelegateSvg, xor_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.xor_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.xor_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first.check = ezP.T3.Expr.Check.xor_expr
  this.inputData_.last.label = '^'
  this.inputData_.last.check = ezP.T3.Expr.Check.and_expr
  this.outputData_.check = ezP.T3.Expr.xor_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.xor_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('xor_expr_concrete')

/**
 * Class for a DelegateSvg, or_expr_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_expr_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_expr_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first.check = ezP.T3.Expr.Check.or_expr
  this.inputData_.last.label = '|'
  this.inputData_.last.check = ezP.T3.Expr.Check.xor_expr
  this.outputData_.check = ezP.T3.Expr.or_expr_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.or_expr_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('or_expr_concrete')

/**
 * Class for a DelegateSvg, number_comparison block.
 * Multiple ops. This is not a list of comparisons, more like a tree.
 * Maybe we should make a flat version in order to compare the blocks
 * if necessary ever.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.number_comparison = function (prototypeName) {
  ezP.DelegateSvg.Expr.number_comparison.superClass_.constructor.call(this, prototypeName)
  this.operators = ['<', '>', '==', '>=', '<=', '!=']
  this.inputData_.first.check = ezP.T3.Expr.Check.comparison
  this.inputData_.last.label = '<'
  this.inputData_.last.check = ezP.T3.Expr.Check.comparison
  this.outputData_.check = ezP.T3.Expr.number_comparison
}
goog.inherits(ezP.DelegateSvg.Expr.number_comparison, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('number_comparison')

/**
 * Class for a DelegateSvg, object_comparison block.
 * Multiple ops. This is not a list of comparisons, more like a tree.
 * Maybe we should make a flat version in order to compare the blocks
 * if necessary ever.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.object_comparison = function (prototypeName) {
  ezP.DelegateSvg.Expr.object_comparison.superClass_.constructor.call(this, prototypeName)
  this.operators = ['is', 'is not', 'in', 'not in']
  this.inputData_.first.check = ezP.T3.Expr.Check.comparison
  goog.mixin(this.inputData_.last, {
    label: 'in',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.comparison,
  })
  this.outputData_.check = ezP.T3.Expr.object_comparison
}
goog.inherits(ezP.DelegateSvg.Expr.object_comparison, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('object_comparison')

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.object_comparison.prototype.getContent = function (block, op) {
  return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
    goog.dom.createTextNode(op),
  )
}

/**
 * Class for a DelegateSvg, or_test_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.or_test_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.or_test_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first.check = ezP.T3.Expr.Check.or_test
  goog.mixin(this.inputData_.last, {
    label: 'or',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.and_test,
  })
  this.outputData_.check = ezP.T3.Expr.or_test_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.or_test_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('or_test_concrete')

/**
 * Class for a DelegateSvg, and_test_concrete block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.and_test_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.and_test_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputData_.first.check = ezP.T3.Expr.Check.and_test
  goog.mixin(this.inputData_.last, {
    label: 'and',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.not_test,
  })
  this.outputData_.check = ezP.T3.Expr.and_test_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.and_test_concrete, ezP.DelegateSvg.Binary)
ezP.DelegateSvg.Manager.register('and_test_concrete')


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
  this.inputData_.first.check = ezP.T3.Expr.Check.augtarget
  this.inputData_.last.wrap = ezP.T3.Expr.aug_assigned
}

goog.inherits(ezP.DelegateSvg.AugAssign, ezP.DelegateSvg.Binary)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.AugAssign.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn
  var target = this.inputs.last.input.connection.targetBlock()
  if (target) {
    var D = ezP.DelegateSvg.Manager.getInputData(target.type)
    if (yorn = mgr.populate_wrap_alternate(target, D.last.key)) {
      mgr.shouldSeparate()
    }
  }
  return ezP.DelegateSvg.AugAssign.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!ezP.MenuManager} mgr mgr.menu The Menu clicked.
 * @param {!goog....} event The event containing the target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.AugAssign.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  return mgr.handleAction_wrap_alternate(block, event) || ezP.DelegateSvg.AugAssign.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}

/**
 * Class for a DelegateSvg, aug_assigned.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.aug_assigned = function (prototypeName) {
  ezP.DelegateSvg.Expr.aug_assigned.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.WRAP,
    check: ezP.T3.Expr.Check.aug_assigned,
    wrap: ezP.T3.Expr.non_void_expression_list,
  }
  this.menuData = [
    {
      content: function(block) {
        var parent = block.getParent()
        var x = '... <<='
        if (parent) {
          x = '... ' + parent.ezp.inputs.last.fieldLabel.getValue()
        }
        return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
          goog.dom.createTextNode(x),
          goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
            goog.dom.createTextNode(' ...'),
          )
        )
      },
      type: ezP.T3.Expr.non_void_expression_list
    },
    {
      content: function(block) {
        var parent = block.getParent()
        var x = '... <<='
        if (parent) {
          x = '... ' + parent.ezp.inputs.last.fieldLabel.getValue()
        }
        return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
          goog.dom.createTextNode(x),
          goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
            goog.dom.createTextNode(' yield'),
          ),
          goog.dom.createTextNode(' ...'),
        )
      },
      type: ezP.T3.Expr.yield_expression_list,
    },
    {
      content: function(block) {
        var parent = block.getParent()
        var x = '... <<='
        if (parent) {
          x = '... ' + parent.ezp.inputs.last.fieldLabel.getValue()
        }
        return goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
          goog.dom.createTextNode(x),
          goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
            goog.dom.createTextNode(' yield from'),
          ),
          goog.dom.createTextNode(' ...'),
        )
      },
      type: ezP.T3.Expr.yield_from_expression,
    },
  ]
  this.outputData_.check = ezP.T3.Expr.aug_assigned
}
goog.inherits(ezP.DelegateSvg.Expr.aug_assigned, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('aug_assigned')

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Expr.aug_assigned.prototype.getWrappedTargetBlock = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.aug_assigned.prototype.populateContextMenuFirst_ = function (block, mgr) {
  if (mgr.populate_wrap_alternate(block, this.inputData.last.key)) {
    mgr.shouldSeparate()
    return true
  }
  return false
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!ezP.MenuManager} mgr mgr.menu The Menu clicked.
 * @param {!goog....} event The event containing the target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.aug_assigned.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  return mgr.handleAction_wrap_alternate(block, event)
  || ezP.DelegateSvg.Expr.aug_assigned.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
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
  this.inputData_.last.label = '+='
  this.outputData_.check = ezP.T3.Expr.augassign_numeric
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
  this.inputData_.last.label = '<<='
  this.outputData_.check = ezP.T3.Expr.augassign_bitwise
}

goog.inherits(ezP.DelegateSvg.Expr.augassign_bitwise, ezP.DelegateSvg.AugAssign)
ezP.DelegateSvg.Manager.register('augassign_bitwise')

///////// power ////////
/**
 * Class for a DelegateSvg, power_concrete block.
 * power_concrete ::= await_or_primary "**" u_expr 
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.power_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.power_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputData_.check = ezP.T3.power_concrete
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.ARG,
      check: ezP.T3.Expr.Check.await_or_primary,
      hole_value: 'name',
    },
    last: {
      key: ezP.Const.Input.POWER,
      label: '**',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.u_expr,
      hole_value: 'power',
    },
  }
}

goog.inherits(ezP.DelegateSvg.Expr.power_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('power_concrete')
