/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Primary')

goog.require('ezP.DelegateSvg.Expr')

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary = function (prototypeName) {
  ezP.DelegateSvg.Primary.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Primary, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Primary.model__ = {
  inputs: {
    i_1: {
      key: ezP.Key.PRIMARY,
      check: ezP.T3.Expr.Check.primary,
      plugged: ezP.T3.Expr.primary,
      hole_value: 'primary',
    },
  },
}

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.prototype.getPrimaryConnection = function (block) {
  return undefined
}

/**
 * The primary connection if any.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Primary.prototype.getPrimaryConnection = function (block) {
  var input = block.getInput(ezP.Key.PRIMARY)
  return input.connection
}

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('attributeref', {
  inputs: {
    i_3: {
      label: '.',
      key: ezP.Key.ATTRIBUTE,
      check: ezP.T3.Expr.identifier,
      plugged: ezP.T3.Expr.attribute_identifier,
      hole_value: 'attribute',
    },
  },
}, ezP.DelegateSvg.Primary)

/**
 * Class for a DelegateSvg, subscription and slicing.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('slicing', {
  inputs: {
    i_3: {
      key: ezP.Key.SLICE,
      wrap: ezP.T3.Expr.display_slice_list,
    },
  },
  output: {
    check: [ezP.T3.Expr.subscription, ezP.T3.Expr.slicing],
  },
}, ezP.DelegateSvg.Primary)

ezP.DelegateSvg.Expr.subscription = ezP.DelegateSvg.Expr.slicing
ezP.DelegateSvg.Manager.register('subscription')

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('call_expr', {
  inputs: {
    i_3: {
      key: ezP.Key.ARGUMENTS,
      start: '(',
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
}, ezP.DelegateSvg.Primary)

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('call_stmt', {
  inputs: {
    i_1: {
      insert: ezP.T3.Expr.call_expr,
    },
  },
})

/**
 * Class for a DelegateSvg, call block, built in functions.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('builtin_call_expr', {
  inputs: {
    subtypes: ['range', 'list', 'set', 'len', 'sum'],
    i_1: {
      label: '',
      css_class: 'ezp-code-builtin',
      key: ezP.Key.ARGUMENTS,
      start: '(',
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
  output: {
    check: [ezP.T3.Expr.call_expr],
  },
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.builtin_call_expr.prototype.didChangeSubtype = function (block, oldSubtype, newSybtype) {
  ezP.DelegateSvg.Expr.builtin_call_expr.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSybtype)
  var subtypes = this.getModel().inputs.subtypes
  var input = block.getInput(ezP.Key.ARGUMENTS)
  var field = input.ezp.fields.label
  field.setValue(newSybtype)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.builtin_call_expr.populateMenu = function (block, mgr) {
  var subtypes = block.ezp.getModel().inputs.subtypes
  var current = block.ezp.getSubtype(block)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setSubtype(block, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  for (var i = 0, k;(k = subtypes[i++]);) {
    F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-builtin',
      goog.dom.createTextNode(k),
    ), k)
  }
  mgr.shouldSeparateInsert()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.builtin_call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Expr.builtin_call_expr.populateMenu(block, mgr)
  return ezP.DelegateSvg.Expr.builtin_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, statement call block, built in functions.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('builtin_call_stmt', {
  inputs: {
    subtypes: ['range', 'list', 'len', 'sum'],
    i_1: {
      insert: ezP.T3.Expr.builtin_call_expr,
    },
  },
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.builtin_call_stmt.prototype.initBlock = function (block) {
  this.getModel = ezP.DelegateSvg.Expr.builtin_call_expr.prototype.getModel
  ezP.DelegateSvg.Stmt.builtin_call_stmt.superClass_.initBlock.call(this, block)
}

/**
 * When the subtype has just changed.
 * @param {!Blockly.Block} block  to be initialized.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.builtin_call_stmt.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.builtin_call_stmt.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  var subtypes = this.getModel().inputs.subtypes
  var input = block.getInput(ezP.Key.ARGUMENTS)
  var field = input.ezp.fields.label
  field.setValue(newSubtype)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.builtin_call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Expr.builtin_call_expr.populateMenu(block, mgr)
  return ezP.DelegateSvg.Stmt.builtin_call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

ezP.DelegateSvg.Primary.T3s = [
  ezP.T3.Expr.attributeref,
  ezP.T3.Expr.slicing,
  ezP.T3.Expr.subscription,
  ezP.T3.Expr.call_expr,
  ezP.T3.Stmt.call_stmt,
  ezP.T3.Expr.builtin_call_expr,
  ezP.T3.Stmt.builtin_call_stmt,
]