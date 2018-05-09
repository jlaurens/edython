/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.DelegateSvg.Print')

goog.require('edY.DelegateSvg.Stmt')
goog.require('edY.DelegateSvg.List')

console.warn('Move this block to the builtin blocks, with contextual consolidator and argument list')
/**
 * Class for a DelegateSvg, print block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('builtin_print_expr', {
  fields: {
    label: {
      value: 'print',
      css: 'builtin',
    },
  },
  tiles: {
    arguments: {
      order: 1,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: edY.T3.Expr.argument_list_comprehensive,
    },
  },
  output: {
    check: [edY.T3.Expr.builtin_print_expr, edY.T3.Expr.call_expr],
  },
})

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
edY.DelegateSvg.Expr.builtin_print_expr.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
edY.DelegateSvg.Expr.builtin_print_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.Menu
  var list = block.getInput(edY.Key.ARGUMENTS).connection.targetBlock()
  var c10r = list.edy.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, edY.T3.Expr.comprehension)) {
    var has = {}
    var io = c10r.getIO(list)
    var input
    while ((input = c10r.nextInputForType(io, edY.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target) {
        has[target.edy.data.value.get()] = target
      }
    }
    var insert = function(key) {
      Blockly.Events.setGroup(true)
      try {
        var B = edY.DelegateSvg.newBlockComplete(block.workspace, edY.T3.Expr.term, true)
        B.edy.data.value.set(key)
        B.edy.data.variant.set(2)
        var c8n = list.inputList[list.inputList.length-1].connection
        c8n.connect(B.outputConnection)  
        block.edy.beReady(block)
      } finally {
        Blockly.Events.setGroup(false)
      }
    }
    var remove = function(key) {
      Blockly.Events.setGroup(true)
      try {
        var B = has[key]
        B.unplug()
        B.dispose()
      } finally {
        Blockly.Events.setGroup(false)
      }
    }
    var F = function(candidate) {
      var menuItem = new edY.MenuItem(
        edY.Do.createSPAN(candidate+' = …', 'edy-code'),
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
  return edY.DelegateSvg.Expr.builtin_print_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, print_stmt block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('builtin_print_stmt', {
   link: edY.T3.Expr.builtin_print_expr,
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
edY.DelegateSvg.Stmt.builtin_print_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.Menu
  var list = block.getInput(edY.Key.ARGUMENTS).connection.targetBlock()
  var c10r = list.edy.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, edY.T3.Expr.comprehension)) {
    var has = {}
    var io = c10r.getIO(list)
    var input
    while ((input = c10r.nextInputForType(io, edY.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target) {
        has[target.edy.data.value.get()] = target
      }
    }
    var insert = function(key) {
      Blockly.Events.setGroup(true)
      try {
        var B = edY.DelegateSvg.newBlockComplete(block.workspace, edY.T3.Expr.term, true)
        B.edy.data.value.set(key)
        B.edy.data.variant.set(2)
        // we assume that inputList is not void
        var c8n = list.inputList[list.inputList.length-1].connection
        c8n.connect(B.outputConnection)  
        block.edy.beReady(block)
      } finally {
        Blockly.Events.setGroup(false)
      }
    }
    var remove = function(key) {
      Blockly.Events.setGroup(true)
      try {
        var B = has[key]
        B.unplug()
        B.dispose()
      } finally {
        Blockly.Events.setGroup(false)
      }
    }
    var F = function(candidate) {
      var menuItem = new edY.MenuItem(
        edY.Do.createSPAN(candidate+' = …', 'edy-code'),
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
  return edY.DelegateSvg.Stmt.builtin_print_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, input block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('builtin_input_expr', {
  fields: {
    label: {
      value: 'input',
    },
  },
  tiles: {
    expression: {
      order: 1,
      fields: {
        start: '(',
        end: ')',
      },
      check: edY.T3.Expr.Check.argument_any,
      optional: true,
    },
  },
  output: {
    check: [edY.T3.Expr.builtin_input_expr, edY.T3.Expr.call_expr],
  },
})

edY.DelegateSvg.Print.T3s = [
  edY.T3.Expr.term,
  edY.T3.Expr.builtin_print_expr,
  edY.T3.Stmt.builtin_print_stmt,
  edY.T3.Expr.builtin_input_expr,
]