/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Print')

goog.require('eYo.DelegateSvg.Stmt')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Term')

console.warn('Move this block to the builtin blocks, with contextual consolidator and argument list')
/**
 * Class for a DelegateSvg, print block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('builtin__print_expr', {
  xml: {
    tag: 'print',
  },
  fields: {
    label: {
      value: 'print',
      css: 'builtin'
    }
  },
  slots: {
    arguments: {
      order: 1,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_comprehensive
    }
  },
  output: {
    check: [eYo.T3.Expr.builtin__print_expr, eYo.T3.Expr.call_expr]
  }
})

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
eYo.DelegateSvg.Expr.builtin__print_expr.prototype.getMenuTarget = function (block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
eYo.DelegateSvg.Expr.builtin__print_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var list = block.getInput(eYo.Key.ARGUMENTS).connection.targetBlock()
  var c10r = list.eyo.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, eYo.T3.Expr.comprehension)) {
    var has = {}
    var io = c10r.getIO(list)
    var input
    while ((input = c10r.nextInputForType(io, eYo.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target) {
        has[target.eyo.data.value.get()] = target
      }
    }
    var insert = function (key) {
      eYo.Events.setGroup(true)
      try {
        var B = eYo.DelegateSvg.newBlockComplete(block.workspace, eYo.T3.Expr.term)
        B.eyo.data.name.set(key)
        B.eyo.data.variant.set(eYo.DelegateSvg.Expr.term.eyo.getModel().data.variant.NAME)
        var c8n = list.inputList[list.inputList.length - 1].connection
        c8n.connect(B.outputConnection)
        block.eyo.beReady(block)
        block.eyo.render(block)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        eYo.Events.setGroup(false)
      }
    }
    var remove = function (key) {
      eYo.Events.setGroup(true)
      try {
        var B = has[key]
        B.unplug()
        B.dispose()
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        eYo.Events.setGroup(false)
      }
    }
    var F = function (candidate) {
      var menuItem = new eYo.MenuItem(
        eYo.Do.createSPAN(candidate + ' = …', 'eyo-code'),
        has[candidate] ? function () {
          remove(candidate)
        } : /** @suppress {globalThis} */ function () {
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
  return eYo.DelegateSvg.Expr.builtin__print_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, print_stmt block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('builtin__print_stmt', {
  inherits: eYo.T3.Expr.builtin__print_expr,
  output: null,
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
eYo.DelegateSvg.Stmt.builtin__print_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var list = block.getInput(eYo.Key.ARGUMENTS).connection.targetBlock()
  var c10r = list.eyo.consolidator
  var yorn = false
  if (!c10r.hasInputForType(list, eYo.T3.Expr.comprehension)) {
    var has = {}
    var io = c10r.getIO(list)
    var input
    while ((input = c10r.nextInputForType(io, eYo.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target) {
        has[target.eyo.data.value.get()] = target
      }
    }
    var insert = function (key) {
      eYo.Events.setGroup(true)
      try {
        var B = eYo.DelegateSvg.newBlockComplete(block.workspace, eYo.T3.Expr.term)
        B.eyo.data.name.set(key)
        B.eyo.data.variant.set(eYo.DelegateSvg.Expr.term.eyo.getModel().data.variant.NAME_DEFINITION)
        // we assume that inputList is not void
        var c8n = list.inputList[list.inputList.length - 1].connection
        c8n.connect(B.outputConnection)
        B.eyo.beReady(block)
        block.eyo.render(block)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        eYo.Events.setGroup(false)
      }
    }
    var remove = function (key) {
      eYo.Events.setGroup(true)
      try {
        var B = has[key]
        B.unplug()
        B.dispose()
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        eYo.Events.setGroup(false)
      }
    }
    var F = function (candidate) {
      var menuItem = new eYo.MenuItem(
        eYo.Do.createSPAN(candidate + ' = …', 'eyo-code'),
        has[candidate] ? function () {
          remove(candidate)
        } : /** @suppress {globalThis} */ function () {
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
  return eYo.DelegateSvg.Stmt.builtin__print_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, input block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('builtin__input_expr', {
  fields: {
    label: {
      value: 'input'
    }
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        start: '(',
        end: ')'
      },
      check: eYo.T3.Expr.Check.argument_any,
      optional: true
    }
  },
  output: {
    check: [eYo.T3.Expr.builtin__input_expr, eYo.T3.Expr.call_expr]
  }
})

eYo.DelegateSvg.Print.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Expr.builtin__print_expr,
  eYo.T3.Stmt.builtin__print_stmt,
  eYo.T3.Expr.builtin__input_expr
]
