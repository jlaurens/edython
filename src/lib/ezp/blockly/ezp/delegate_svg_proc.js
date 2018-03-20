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
decorator_stmt :: decorator_expr | decorator_call_expr
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
    key: ezP.Key.NAME,
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
    key: ezP.Key.PARENT,
    check: ezP.T3.Expr.identifier,
    hole_value: 'parent',
  }
  this.inputModel_.last = {
    label: '.',
    key: ezP.Key.NAME,
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
    key: ezP.Key.NAME,
    wrap: ezP.T3.Expr.decorator_expr,
  }
  this.inputModel_.last = {
    start: '(',
    key: ezP.Key.LIST,
    wrap: ezP.T3.Expr.argument_list,
    end: ')',
  }
  this.outputModel_.check = ezP.T3.Expr.decorator_call_expr
}
goog.inherits(ezP.DelegateSvg.Expr.decorator_call_expr, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('decorator_call_expr')

/**
 * Class for a DelegateSvg, decorator_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator_stmt            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp_decorator_stmt",
ezP.DelegateSvg.Stmt.decorator_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.decorator_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.WRAP,
    wrap: ezP.T3.Expr.decorator_expr,
    check: ezP.T3.Expr.Check.decorator,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.decorator_stmt
  this.statementModel_.next.check = ezP.T3.Stmt.Next.decorator_stmt
}
goog.inherits(ezP.DelegateSvg.Stmt.decorator_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('decorator_stmt')

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
  var c8n = this.inputs.first.input.connection
  var target = c8n.targetBlock()
  if (!target) {
    var F = function(candidate) {
      var menuItem = new ezP.MenuItemCode('@'+candidate, function() {
        Blockly.Events.setGroup(true)
        target = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.identifier)
        target.ezp.setValue(target, candidate)
        c8n.connect(target.outputConnection)
        Blockly.Events.setGroup(false)
      })
      menu.addChild(menuItem, true)
      return true
  }
    var yorn = F('staticmethod')
    yorn = F('classmethod') || yorn
  } else if (target.ezp.getValue && target.ezp.setValue) {
    var old = target.ezp.getValue(target)
    var F = function(candidate) {
      if (old !== candidate) {
        var menuItem = new ezP.MenuItemCode('@'+candidate, function() {
          Blockly.Events.setGroup(true)
          target.ezp.setValue(target, candidate)
          Blockly.Events.setGroup(false)
        })
        menu.addChild(menuItem, true)
        return true
      }
      return false
    }
    var yorn = F('staticmethod')
    yorn = F('classmethod') || yorn
  }
  return ezP.DelegateSvg.Expr.decorator_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, funcdef_simple block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.funcdef_simple = function (prototypeName) {
  ezP.DelegateSvg.Expr.funcdef_simple.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: 'def',
    css_class: 'ezp-code-reserved',
    key: ezP.Key.NAME,
    check: ezP.T3.Expr.identifier,
    hole_value: 'name',
  }
  this.inputModel_.middle = {
    start: '(',
    key: ezP.Key.LIST,
    wrap: ezP.T3.Expr.parameter_list,
    end: ')',
  }
  this.outputModel_.check = ezP.T3.Expr.funcdef_simple
}
goog.inherits(ezP.DelegateSvg.Expr.funcdef_simple, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('funcdef_simple')

/**
 * The overriden implementation is true.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @override
 */
ezP.DelegateSvg.Expr.funcdef_simple.prototype.canUnwrap = function(block) {
  return true
}

/**
 * Class for a DelegateSvg, funcdef_typed block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.funcdef_typed = function (prototypeName) {
  ezP.DelegateSvg.Expr.funcdef_typed.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.DEFINITION,
    wrap: ezP.T3.Expr.funcdef_simple,
  }
  this.inputModel_.last = {
    label: '->',
    key: ezP.Key.TYPE,
    check: ezP.T3.Expr.Check.expression,
  }
  this.outputModel_.check = ezP.T3.Expr.funcdef_typed
}
goog.inherits(ezP.DelegateSvg.Expr.funcdef_typed, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('funcdef_typed')


/**
 * Class for a DelegateSvg, funcdef_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.funcdef_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.funcdef_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    asyncable: true,
    css_class: 'ezp-code-reserved',
    key: ezP.Key.WRAP,
    check: ezP.T3.Expr.Check.funcdef_expr,
    wrap: ezP.T3.Expr.funcdef_simple,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.funcdef_part, ezP.DelegateSvg.Group.Async)
ezP.DelegateSvg.Manager.register('funcdef_part')

/*
classdef_part ::=  classdef_expr ':'
classdef_expr ::= classdef_simple | classdef_derived
classdef_simple ::=  "class" classname
classdef_derived ::=  classdef_simple parenth_argument_list
*/

/**
 * Class for a DelegateSvg, classdef_simple block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.classdef_simple = function (prototypeName) {
  ezP.DelegateSvg.Expr.classdef_simple.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: 'class',
    css_class: 'ezp-code-reserved',
    key: ezP.Key.NAME,
    check: ezP.T3.Expr.identifier,
    hole_value: 'name',
  }
  this.outputModel_.check = ezP.T3.Expr.classdef_simple
}
goog.inherits(ezP.DelegateSvg.Expr.classdef_simple, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('classdef_simple')

/**
 * The overriden implementation is true.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @override
 */
ezP.DelegateSvg.Expr.classdef_simple.prototype.canUnwrap = function(block) {
  return true
}

/**
 * Class for a DelegateSvg, classdef_derived block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.classdef_derived = function (prototypeName) {
  ezP.DelegateSvg.Expr.classdef_derived.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      key: ezP.Key.DEFINITION,
      wrap: ezP.T3.Expr.classdef_simple,
    },
    last: {
      start: '(',
      key: ezP.Key.LIST,
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    }
  }
  this.outputModel_.check = ezP.T3.Expr.classdef_derived
}
goog.inherits(ezP.DelegateSvg.Expr.classdef_derived, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('classdef_derived')

/**
 * The overriden implementation is true.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @override
 */
ezP.DelegateSvg.Expr.classdef_derived.prototype.canUnwrap = function(block) {
  return true
}

/**
 * Class for a DelegateSvg, classdef_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.classdef_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.classdef_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.WRAP,
    check: ezP.T3.Expr.Check.classdef_expr,
    wrap: ezP.T3.Expr.classdef_simple,
  }
  this.menuData = [
    {
      content: goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        ezP.Do.createSPAN('class', 'ezp-code-reserved'),
        ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
      ),
      type: ezP.T3.Expr.classdef_simple
    },
    {
      content:   goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        ezP.Do.createSPAN('class', 'ezp-code-reserved'),
        ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
        ezP.Do.createSPAN('('),
        ezP.Do.createSPAN('…', 'ezp-code-placeholder'),
        ezP.Do.createSPAN(')'),
    ),
      type: ezP.T3.Expr.classdef_derived
    },
  ]
}
goog.inherits(ezP.DelegateSvg.Stmt.classdef_part, ezP.DelegateSvg.Group)
ezP.DelegateSvg.Manager.register('classdef_part')

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn
  var D = ezP.DelegateSvg.Manager.getInputModel(block.type)
  if (yorn = mgr.populate_wrap_alternate(block, D.first.key)) {
    mgr.shouldSeparate()
  }
  return ezP.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr) || yorn
}
