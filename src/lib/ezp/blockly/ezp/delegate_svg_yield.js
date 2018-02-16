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

goog.provide('ezP.DelegateSvg.Yield')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')

/////////////////     yield_expression_list      ///////////////////

/**
 * Class for a DelegateSvg, 'yield ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_expression_list.superClass_.constructor.call(this, prototypeName)
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.LIST,
      label: 'yield',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.non_void_expression_list,
    }
  }
  this.outputCheck = ezP.T3.Expr.yield_expression_list
}
goog.inherits(ezP.DelegateSvg.Expr.yield_expression_list, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('yield_expression_list')

/**
 * Class for a DelegateSvg, 'yield from ...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_from_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_from_expression.superClass_.constructor.call(this, prototypeName)
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.EXPR,
      label: 'yield from',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression
    }
  }
  this.outputCheck = ezP.T3.Expr.yield_from_expression
}
goog.inherits(ezP.DelegateSvg.Expr.yield_from_expression, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('yield_from_expression')

/**
 * Class for a DelegateSvg, '(yield ..., ..., ...)'.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_atom = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_atom.superClass_.constructor.call(this, prototypeName)
  this.inputData_ = {
    first: {
      key: ezP.Const.Input.EXPR,
      label: '(',
      wrap: ezP.T3.Expr.yield_expression,
    }
  }
  this.labelEnd.value = ')'
  this.outputCheck = ezP.T3.Expr.yield_atom
}
goog.inherits(ezP.DelegateSvg.Expr.yield_atom, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('yield_atom')

/**
 * Class for a DelegateSvg, yield_expression.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.yield_expression = function (prototypeName) {
  ezP.DelegateSvg.Expr.yield_expression.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.LIST,
    wrap: ezP.T3.Expr.yield_expression_list,
  }
  this.outputCheck = ezP.T3.Expr.yield_expression
  this.menuData = [
    {
      label: goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
          goog.dom.createTextNode('yield'),
        ),
        goog.dom.createTextNode(' ...'),
      ),
      type: ezP.T3.Expr.yield_expression_list
    },
    {
      label: goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
          goog.dom.createTextNode('yield from'),
        ),
        goog.dom.createTextNode(' ...'),
      ),
      type: ezP.T3.Expr.yield_from_expression
    },
  ]

}
goog.inherits(ezP.DelegateSvg.Expr.yield_expression, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('yield_expression')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn
  var D = ezP.DelegateSvg.Manager.getInputData(block.type)
  if (yorn = mgr.populate_wrap_alternate(target, D.last.key)) {
    mgr.shouldSeparate()
  }
  return ezP.DelegateSvg.Expr.yield_expression.superClass_.populateContextMenuFirst_.call(this,block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Undo compliant.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!String} newType
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.changeYieldWrapType = function (block, newValue) {
  var last = this.inputs.last.input
  var target = last.connection.targetBlock()
  var oldValue = target? target.type: undefined
  if (newValue != oldValue) {
    Blockly.Events.setGroup(true)
    // if (Blockly.Events.isEnabled()) {
    //   Blockly.Events.fire(new Blockly.Events.BlockChange(
    //     block, ezP.Const.Event.change_import_model, '', oldValue, newValue));
    // }
    if (target) {
//      target.unplug()
      target.dispose()
    }
    this.completeWrappedInput_(block, last, newValue)
    Blockly.Events.setGroup(false)
  }
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  return mgr.handleAction_wrap_alternate(block, event) || ezP.DelegateSvg.Expr.yield_expression.superClass_.handleMenuItemActionMiddle.call(this, block, mgr, event)
}

/**
 * Class for a DelegateSvg, yield_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.yield_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.yield_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData_.last = {
    key: ezP.Const.Input.EXPR,
    wrap: ezP.T3.Expr.yield_expression,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.yield_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('yield_stmt')

