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

goog.provide('ezP.DelegateSvg.Try')

goog.require('ezP.DelegateSvg.Group')

/**
 * Class for a DelegateSvg, try_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('try_part', {
  inputs: {
    i_1: {
      dummy: 'try',
      css_class: 'ezp-code-reserved',
    },
  },
}, ezP.DelegateSvg.Group)

/**
 * Class for a DelegateSvg, except_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('except_part', {
  inputs: {
    subtypes: [null, ezP.Key.EXPRESSION, ezP.Key.AS],
    prefix: {
      label: 'except',
      css_class: 'ezp-code-reserved',
    },
    i_1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    i_2: {
      key: ezP.Key.AS,
      label: 'as',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
    },
  },
}, ezP.DelegateSvg.Group)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.except_part.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.except_part.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  var subtypes = this.getModel().inputs.subtypes
  var F = function(k) {
    block.ezp.setupType(block, ezP.T3.Stmt[k])
    block.nextConnection.setCheck(ezP.T3.Stmt.Next[k])
    block.previousConnection.setCheck(ezP.T3.Stmt.Previous[k])
  }
  var i = subtypes.indexOf(newSubtype)
  block.ezp.setNamedInputDisabled(block, subtypes[1], i < 1)
  block.ezp.setNamedInputDisabled(block, subtypes[2], i < 2)
  F(i > 0? 'except_part': 'void_except_part')
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.except_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.ezp.getSubtype(block)
  var subtypes = this.getModel().inputs.subtypes
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setSubtype(block, k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('except:'),
    ), subtypes[0]
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('except ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…:'),
    ), subtypes[1]
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('except', 'ezp-code-reserved'),
      goog.dom.createTextNode(' … '),
      ezP.Do.createSPAN(' as', 'ezp-code-reserved'),
      goog.dom.createTextNode(' …:'),
    ), subtypes[2]
  )
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.except_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/**
 * Class for a DelegateSvg, finally_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('finally_part', {
  inputs: {
    i_1: {
      dummy: 'finally',
      css_class: 'ezp-code-reserved',
    },
  },
}, ezP.DelegateSvg.Group)

/**
 * Class for a DelegateSvg, raise_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('raise_stmt', {
  inputs: {
    subtypes: [null, ezP.Key.EXPRESSION, ezP.Key.FROM],
    prefix: {
      label: 'raise',
      css_class: 'ezp-code-reserved',
    },
    i_1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    i_2: {
      label: 'from',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.FROM,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
  },
})

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.raise_stmt.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.raise_stmt.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  var subtypes = this.getModel().inputs.subtypes
  var i = subtypes.indexOf(newSubtype)
  block.ezp.setNamedInputDisabled(block, subtypes[1], i < 1)
  block.ezp.setNamedInputDisabled(block, subtypes[2], i < 2)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.raise_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.ezp.getSubtype(block)
  var subtypes = this.getModel().inputs.subtypes
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setSubtype(block, k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('raise'),
    ), subtypes[0]
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('raise ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), subtypes[1]
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('raise', 'ezp-code-reserved'),
      goog.dom.createTextNode(' … '),
      ezP.Do.createSPAN(' from', 'ezp-code-reserved'),
      goog.dom.createTextNode(' …'),
    ), subtypes[2]
  )
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.raise_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/**
 * Class for a DelegateSvg, assert_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('assert_stmt', {
  inputs: {
    subtypes: [null, ezP.Key.EXPRESSION],
    i_1: {
      label: 'assert',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.ASSERT,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    i_3: {
      label: ',',
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    }
  },
})

/**
 * Hook after the subtype change.
 * Default implementation does nothing.
 * Subclassers will take care of undo compliance.
 * When undoing, care must be taken not to fire new events.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Stmt.assert_stmt.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.assert_stmt.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  block.ezp.setNamedInputDisabled(block, ezP.Key.EXPRESSION, newSubtype !== ezP.Key.EXPRESSION)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.assert_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.ezp.getSubtype(block)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setSubtype(block, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('assert ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), null
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('assert ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…, …'),
    ), ezP.Key.EXPRESSION
  )
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.assert_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

ezP.DelegateSvg.Try.T3s = [
  ezP.T3.Stmt.try_part,
  ezP.T3.Stmt.except_part,
  ezP.T3.Stmt.finally_part,
  ezP.T3.Stmt.raise_stmt,
  ezP.T3.Stmt.assert_stmt,
]
