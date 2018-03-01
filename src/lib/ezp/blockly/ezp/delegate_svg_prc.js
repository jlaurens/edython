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

goog.provide('ezP.DelegateSvg.Proc')

goog.require('ezP.DelegateSvg.Group')
goog.require('ezP.MenuItemCode')
/*
decorator_part :: decorator_expr | decorator_call_expr
decorator_expr ::= "@" dotted_funcname
decorator_call_expr ::= decorator_expr "(" argument_list ")"
*/


/**
 * Class for a DelegateSvg, decorator_expr block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.decorator_expr = function (prototypeName) {
  ezP.DelegateSvg.Expr.decorator_expr.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: '@',
    key: ezP.Const.Input.NAME,
    check: ezP.T3.Expr.Check.dotted_funcname,
    hole_value: 'name',
  }
  this.outputModel_.check = ezP.T3.Expr.decorator_expr
}
goog.inherits(ezP.DelegateSvg.Expr.decorator_expr, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('decorator_expr')

/**
 * The overriden implementation is true.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @override
 */
ezP.DelegateSvg.Expr.decorator_expr.prototype.canUnwrap = function(block) {
  return true
}

/**
 * Class for a DelegateSvg, dotted_funcname_concrete block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.dotted_funcname_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.dotted_funcname_concrete.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Const.Input.PARENT,
    check: ezP.T3.Expr.identifier,
    hole_value: 'parent',
  }
  this.inputModel_.last = {
    label: '.',
    key: ezP.Const.Input.NAME,
    check: ezP.T3.Expr.Check.dotted_funcname,
    hole_value: 'name',
  }
  this.outputModel_.check = ezP.T3.Expr.dotted_funcname_concrete
}
goog.inherits(ezP.DelegateSvg.Expr.dotted_funcname_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('dotted_funcname_concrete')


/**
 * Class for a DelegateSvg, decorator_call_expr block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.decorator_call_expr = function (prototypeName) {
  ezP.DelegateSvg.Expr.decorator_call_expr.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Const.Input.NAME,
    wrap: ezP.T3.Expr.decorator_expr,
  }
  this.inputModel_.last = {
    start: '(',
    key: ezP.Const.Input.LIST,
    wrap: ezP.T3.Expr.argument_list,
    end: ')',
  }
  this.outputModel_.check = ezP.T3.Expr.decorator_call_expr
}
goog.inherits(ezP.DelegateSvg.Expr.decorator_call_expr, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('decorator_call_expr')

/**
 * Class for a DelegateSvg, decorator_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator_part            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp_decorator_part",

ezP.DelegateSvg.Stmt.decorator_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.decorator_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Const.Input.WRAP,
    wrap: ezP.T3.Expr.decorator_expr,
    check: ezP.T3.Expr.Check.decorator,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.decorator_part
  this.statementModel_.next.check = ezP.T3.Stmt.Next.decorator_part
}
goog.inherits(ezP.DelegateSvg.Stmt.decorator_part, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('decorator_part')

ezP.ID.USE_DECORATOR = 'USE_DECORATOR'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Expr.decorator_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var yorn = false
  var target = this.inputs.first.input.connection.targetBlock()
  if (target) {
    if (target.ezp.getValue && target.ezp.setValue) {
      var old = target.ezp.getValue(target)
      var F = function(candidate) {
        if (old !== candidate) {
          var menuItem = new ezP.MenuItemCode('@'+candidate, {
            action: ezP.ID.USE_DECORATOR,
            value: candidate,
            target: block,
          })
          menu.addChild(menuItem, true)
          return true
        }
        return false
      }
      var yorn = F('staticmethod')
      yorn = F('classmethod') || yorn
    }
  } else {
    var F = function(candidate) {
      var menuItem = new ezP.MenuItemCode('@'+candidate, {
        action: ezP.ID.USE_DECORATOR,
        value: candidate,
        target: block,
      })
      menu.addChild(menuItem, true)
    }
    F('staticmethod')
    F('classmethod')
    yorn = true
  }
  return ezP.DelegateSvg.Expr.decorator_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.decorator_expr.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  var model = event.target.getModel()
  if (model.action == ezP.ID.USE_DECORATOR) {
    Blockly.Events.setGroup(true)
    var target = model.target
    if (!target.ezp.setValue) {
      var holes = ezP.HoleFiller.getDeepHoles(target)
      ezP.HoleFiller.fillDeepHoles(target.workspace, holes)
      if (!(target = this.inputs.first.input.connection.targetBlock()) || !target.ezp.setValue) {
        Blockly.Events.setGroup(false)// undo some things here ?
        return true
      }
    }
    target.ezp.setValue(target, model.value)
    Blockly.Events.setGroup(false)
    return true
  }
  return ezP.DelegateSvg.Expr.decorator_expr.superClass_.handleMenuItemActionFirst.call(this, block, mgr, event)
}


/**
 * Class for a DelegateSvg, proc block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Proc = function (prototypeName) {
  ezP.DelegateSvg.Proc.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Proc, ezP.DelegateSvg.Group)
//ezP.DelegateSvg.Manager.register('DEFAULT')
//ezP.DelegateSvg.Manager.register('DEF')
//ezP.DelegateSvg.Manager.register('CLASS')
