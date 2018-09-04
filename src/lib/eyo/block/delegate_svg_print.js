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
goog.require('eYo.DelegateSvg.Primary')

console.warn('Move this block to the builtin blocks, with contextual consolidator and argument list')


/**
 * List consolidator for argument list.
 * Rules are a bit stronger than python requires originally
 * 1) If there is a comprehension, it must be alone.
 * 2) positional arguments come first, id est expression and starred expressions
 * 3) then come keyword items or double starred expressions
 * Main entry: consolidate
 */
eYo.Consolidator.Arguments.makeSubclass('PrintArguments', {
}, eYo.Consolidator.Arguments, eYo.Consolidator)

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.PrintArguments.prototype.doFinalize = function (io) {
  eYo.Consolidator.PrintArguments.superClass_.doFinalize.call(this, io)
  // disable all the separators that follow a keyword argument
  // show the separator that precedes the first keyword argument
  if (!this.hasInputForType(io.block, eYo.T3.Expr.comprehension)) {
    this.setupIO(io, 0)
    var input
    while ((input = this.nextInputForType(io, eYo.T3.Expr.keyword_item))) {
      var target = input.connection.targetBlock()
      if (target) {
        if (io.i-- && this.setupIO(io)) {
          if (!io.c8n.targetConnection) {
            io.c8n.setHidden(false)
            io.c8n.eyo.disabled_ = false
          }
          ++io.i
          this.setupIO(io)
        }
        while (this.nextInput(io)) {
          if ((target = io.c8n.targetConnection)) {
            continue
          }
          io.c8n.setHidden(true)
          io.c8n.eyo.disabled_ = true
        }
      }
    }
  }
}

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
      wrap: eYo.T3.Expr.print_argument_list_comprehensive
    }
  },
  output: {
    check: [eYo.T3.Expr.builtin__print_expr, eYo.T3.Expr.call_expr]
  }
})

/**
 * Class for a DelegateSvg, print_argument_list_comprehensive block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.argument_list_comprehensive.makeSubclass('print_argument_list_comprehensive', {
  list: {
    consolidator: eYo.Consolidator.PrintArguments,
  }
}, eYo.DelegateSvg.Expr)

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
      if (target && target.eyo.data.value) {
        has[target.eyo.data.value.get()] = target
      }
    }
    var insert = function (key) {
      eYo.Events.setGroup(true)
      try {
        var B = eYo.DelegateSvg.newBlockReady(block.workspace, eYo.T3.Expr.term)
        B.eyo.data.name.set(key)
        B.eyo.data.variant.set(eYo.DelegateSvg.Expr.primary.eyo.getModel().data.variant.NAME)
        var c8n = list.inputList[list.inputList.length - 1].connection
        c8n.connect(B.outputConnection)
        block.eyo.render()
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
      var menuItem = mgr.newMenuItem(
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
      if (target && target.eyo.data.value) {
        has[target.eyo.data.value.get()] = target
      }
    }
    var insert = function (key) {
      eYo.Events.setGroup(true)
      try {
        var B = eYo.DelegateSvg.newBlockReady(block.workspace, eYo.T3.Expr.term)
        B.eyo.data.name.set(key)
        B.eyo.data.variant.set(eYo.DelegateSvg.Expr.primary.eyo.getModel().data.variant.NAME_DEFINITION)
        // we assume that inputList is not void
        var c8n = list.inputList[list.inputList.length - 1].connection
        c8n.connect(B.outputConnection)
        block.eyo.render()
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
      var menuItem = mgr.newMenuItem(
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

eYo.DelegateSvg.Print.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Expr.builtin__print_expr,
  eYo.T3.Stmt.builtin__print_stmt
]
