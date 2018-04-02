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

goog.provide('ezP.DelegateSvg.Print')

goog.require('ezP.DelegateSvg.Stmt')
goog.require('ezP.DelegateSvg.List')

/**
 * Class for a DelegateSvg, print block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.print_builtin = function (prototypeName) {
  ezP.DelegateSvg.Expr.print_builtin.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      label: 'print',
      css_class: 'ezp-code-builtin',
    },
    last: {
      start: '(',
      key: ezP.Key.LIST,
      wrap: ezP.T3.Expr.argument_list_comprehensive,
      end: ')',
    }
  }
  this.outputModel_ = {
    check: [ezP.T3.Expr.print_builtin, ezP.T3.Expr.call_expr],
  }
}
goog.inherits(ezP.DelegateSvg.Expr.print_builtin, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('print_builtin')


ezP.ID.PRINT_KEYWORD_ITEM_INSERT = 'PRINT_KEYWORD_ITEM_INSERT'
ezP.ID.PRINT_KEYWORD_ITEM_REMOVE = 'PRINT_KEYWORD_ITEM_REMOVE'

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Expr.print_builtin.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Expr.print_builtin.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.Menu
  var list = block.getInput(ezP.Key.LIST).connection.targetBlock()
  var c10r = list.ezp.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, ezP.T3.Expr.comprehension)) {
    var has = {}
    var io = c10r.getIO(list)
    var input
    while ((input = c10r.nextInputForType(io, ezP.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target && (target = target.getInput(ezP.Key.KEY).connection.targetBlock())) {
        has[target.ezp.getValue(target)] = target
      }
    }
    var insert = function(key) {
      Blockly.Events.setGroup(true)
      var BB = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.identifier)
      BB.ezp.setValue(BB, key)
      var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.keyword_item)
      B.getInput(ezP.Key.KEY).connection.connect(BB.outputConnection)
      var c8n = list.inputList[list.inputList.length-1].connection
      c8n.connect(B.outputConnection)  
      block.ezp.consolidate(block)
      Blockly.Events.setGroup(false)
    }
    var remove = function(key) {
      Blockly.Events.setGroup(true)
      var B = has[key].getParent()
      B.unplug()
      B.dispose()
      Blockly.Events.setGroup(false)
    }
    var F = function(candidate) {
      var menuItem = new ezP.MenuItem(
        ezP.Do.createSPAN(candidate+' = …', 'ezp-code'),
        has[candidate]? function() {
          remove(candidate)
        }: function() {
          insert(candidate)
        }
      )
      if (has[candidate]) {
        mgr.addRemoveChild(menuItem)
      } else {
        mgr.addInsertChild(menuItem)
      }
    }
    F('sep')
    F('end')
    F('file')
    yorn = true
  }
  return ezP.DelegateSvg.Expr.print_builtin.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, print_stmt block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.print_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.print_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    wrap: ezP.T3.Expr.print_builtin,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.print_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('print_stmt')

/**
 * Class for a DelegateSvg, input block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.input_builtin = function (prototypeName) {
  ezP.DelegateSvg.Expr.input_builtin.superClass_.constructor.call(this, prototypeName)
  this.inputModel_ = {
    first: {
      label: 'input',
      css_class: 'ezp-code-builtin',
    },
    last: {
      start: '(',
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.argument_any,
      optional: true,
      end: ')',
    }
  }
  this.outputModel_ = {
    check: [ezP.T3.Expr.input_builtin, ezP.T3.Expr.call_expr],
  }
}
goog.inherits(ezP.DelegateSvg.Expr.input_builtin, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('input_builtin')

/**
 * Class for a DelegateSvg, input_stmt block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.input_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.input_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    key: ezP.Key.EXPRESSION,
    wrap: ezP.T3.Expr.input_builtin,
  }
}
goog.inherits(ezP.DelegateSvg.Stmt.input_stmt, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('input_stmt')
