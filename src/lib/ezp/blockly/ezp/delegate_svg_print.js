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
ezP.DelegateSvg.Manager.makeSubclass('builtin_print_expr', {
  inputs: {
    i_1: {
      label: 'print',
      css_class: 'ezp-code-builtin',
    },
    i_3: {
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
      if (target && (target = target.getInput(ezP.Key.KEY).connection.targetBlock())) {
        has[target.ezp.getValue(target)] = target
      }
    }
    var insert = function(key) {
      var grouper = new ezP.Events.Grouper()
      try {
        var BB = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.identifier)
        BB.ezp.setValue(BB, key)
        var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.keyword_item)
        B.getInput(ezP.Key.KEY).connection.connect(BB.outputConnection)
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
        var B = has[key].getParent()
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
 ezP.DelegateSvg.Manager.makeSubclass('builtin_print_stmt', {
   inputs: {
     i_1: {
      insert: ezP.T3.Expr.builtin_print_expr,
    }
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
      if (target && (target = target.getInput(ezP.Key.KEY).connection.targetBlock())) {
        has[target.ezp.getValue(target)] = target
      }
    }
    var insert = function(key) {
      var grouper = new ezP.Events.Grouper()
      try {
        var BB = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.identifier)
        BB.ezp.setValue(BB, key)
        var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.keyword_item)
        B.getInput(ezP.Key.KEY).connection.connect(BB.outputConnection)
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
        var B = has[key].getParent()
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
ezP.DelegateSvg.Manager.makeSubclass('builtin_input_expr', {
  inputs: {
    i_1: {
      label: 'input',
      css_class: 'ezp-code-builtin',
    },
    i_3: {
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

/**
 * Class for a DelegateSvg, builtin_input_stmt block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('builtin_input_stmt', {
  inputs: {
    i_1: {
      insert: ezP.T3.Expr.builtin_input_expr,
    },
  },
})

ezP.DelegateSvg.Print.T3s = [
  ezP.T3.Expr.builtin_print_expr,
  ezP.T3.Stmt.builtin_print_stmt,
  ezP.T3.Expr.builtin_input_expr,
  ezP.T3.Stmt.builtin_input_stmt,
]