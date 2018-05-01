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

goog.provide('ezP.DelegateSvg.Print')

goog.require('ezP.DelegateSvg.Stmt')
goog.require('ezP.DelegateSvg.List')

console.warn('Move this block to the builtin blocks, with contextual consolidator and argument list')
/**
 * Class for a DelegateSvg, print block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('builtin_print_expr', {
  inputs: {
    1: {
      label: 'print',
      css_class: 'ezp-code-builtin',
    },
    3: {
      start: '(',
      key: ezP.Key.ARGUMENTS,
      wrap: ezP.T3.Expr.argument_list_comprehensive,
      end: ')',
    }
  },
  output: {
    check: [ezP.T3.Expr.builtin_print_expr, ezP.T3.Expr.call_expr],
  },
})

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Expr.builtin_print_expr.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Expr.builtin_print_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.Menu
  var list = block.getInput(ezP.Key.ARGUMENTS).connection.targetBlock()
  var c10r = list.ezp.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, ezP.T3.Expr.comprehension)) {
    var has = {}
    var io = c10r.getIO(list)
    var input
    while ((input = c10r.nextInputForType(io, ezP.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target) {
        has[target.ezp.data.value.get()] = target
      }
    }
    var insert = function(key) {
      var grouper = new ezP.Events.Grouper()
      try {
        var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.term)
        B.ezp.data.value.set(key)
        B.ezp.data.variant.set(2)
        var c8n = list.inputList[list.inputList.length-1].connection
        c8n.connect(B.outputConnection)  
        block.ezp.consolidate(block)
      } finally {
        grouper.stop()
      }
    }
    var remove = function(key) {
      var grouper = new ezP.Events.Grouper()
      try {
        var B = has[key]
        B.unplug()
        B.dispose()
      } finally {
        grouper.stop()
      }
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
  return ezP.DelegateSvg.Expr.builtin_print_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, print_stmt block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
 ezP.DelegateSvg.Stmt.makeSubclass('builtin_print_stmt', {
   inputs: {
    insert: ezP.T3.Expr.builtin_print_expr,
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Stmt.builtin_print_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.Menu
  var list = block.getInput(ezP.Key.ARGUMENTS).connection.targetBlock()
  var c10r = list.ezp.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, ezP.T3.Expr.comprehension)) {
    var has = {}
    var io = c10r.getIO(list)
    var input
    while ((input = c10r.nextInputForType(io, ezP.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target) {
        has[target.ezp.data.value.get()] = target
      }
    }
    var insert = function(key) {
      var grouper = new ezP.Events.Grouper()
      try {
        var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.term)
        B.ezp.data.value.set(key)
        B.ezp.data.variant.set(2)
        // we assume that inputList is not void
        var c8n = list.inputList[list.inputList.length-1].connection
        c8n.connect(B.outputConnection)  
        block.ezp.consolidate(block)
      } finally {
        grouper.stop()
      }
    }
    var remove = function(key) {
      var grouper = new ezP.Events.Grouper()
      try {
        var B = has[key]
        B.unplug()
        B.dispose()
      } finally {
        grouper.stop()
      }
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
  return ezP.DelegateSvg.Stmt.builtin_print_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, input block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('builtin_input_expr', {
  inputs: {
    1: {
      label: 'input',
      css_class: 'ezp-code-builtin',
    },
    3: {
      start: '(',
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.argument_any,
      optional: true,
      end: ')',
    }
  },
  output: {
    check: [ezP.T3.Expr.builtin_input_expr, ezP.T3.Expr.call_expr],
  },
})

ezP.DelegateSvg.Print.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.builtin_print_expr,
  ezP.T3.Stmt.builtin_print_stmt,
  ezP.T3.Expr.builtin_input_expr,
]