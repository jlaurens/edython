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
ezP.DelegateSvg.Group.makeSubclass('try_part', {
  fields: {
    prefix: {
      label: 'try',
      css_class: 'ezp-code-reserved',
    },
  },
})

/**
 * Class for a DelegateSvg, except_part block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Group.makeSubclass('except_part', {
  data: {
    variant: {
      all: [0, 1, 2],
      default: 0,
      didChange: function(oldValue, newValue) {
        var ezp = this.owner_
        var block = ezp.block_
        ezp.consolidateType(block)
      },
      synchronize: function(newValue) {
        this.setInputDisabled(1, newValue < 1)
        this.setInputDisabled(2, newValue < 2)
      },
    },
  },
  fields: {
    prefix: {
      label: 'except',
      css_class: 'ezp-code-reserved',
    },
  },
  inputs: {
    1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    2: {
      key: ezP.Key.AS,
      label: 'as',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
    },
  },
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.except_part.prototype.consolidateType = function (block) {
  var variant = this.data.variant.get()
  var F = function(k) {
    this.setupType(block, ezP.T3.Stmt[k])
    block.nextConnection.setCheck(ezP.T3.Stmt.Next[k])
    block.previousConnection.setCheck(ezP.T3.Stmt.Previous[k])
  }
  F.call(this, variant > 0? 'except_part': 'void_except_part')
  ezP.DelegateSvg.Stmt.except_part.superClass_.consolidateType.call(this, block)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.except_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.ezp.data.variant.get()
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('except:'),
    ), 0
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('except ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…:'),
    ), 1
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('except', 'ezp-code-reserved'),
      goog.dom.createTextNode(' … '),
      ezP.Do.createSPAN(' as', 'ezp-code-reserved'),
      goog.dom.createTextNode(' …:'),
    ), 2
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
ezP.DelegateSvg.Group.makeSubclass('finally_part', {
  fields: {
    prefix: {
      label: 'finally',
      css_class: 'ezp-code-reserved',
    } 
  }
})

/**
 * Class for a DelegateSvg, raise_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('raise_stmt', {
  data: {
    variant: {
      all: [0, 1, 2],
      default: 0,
      synchronize: function(newValue) {
        this.setInputDisabled(1, newValue < 1)
        this.setInputDisabled(2, newValue < 2)
      },
    },
  },
  fields: {
    prefix: {
      label: 'raise',
      css_class: 'ezp-code-reserved',
    },
  },
  inputs: {
    1: {
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    2: {
      label: 'from',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.FROM,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.raise_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.ezp.data.variant.get()
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('raise'),
    ), 0
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('raise ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), 1
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('raise', 'ezp-code-reserved'),
      goog.dom.createTextNode(' … '),
      ezP.Do.createSPAN(' from', 'ezp-code-reserved'),
      goog.dom.createTextNode(' …'),
    ), 2
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
ezP.DelegateSvg.Stmt.makeSubclass('assert_stmt', {
  data: {
    variant: {
      all: [0, 1],
      default: 0,
      synchronize: function(newValue) {
        this.setInputDisabled(3, newValue < 1)
      },
    },
  },
  inputs: {
    1: {
      label: 'assert',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.ASSERT,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    3: {
      label: ',',
      key: ezP.Key.EXPRESSION,
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    }
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.assert_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.ezp.data.variant.get()
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('assert ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), 0
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('assert ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…, …'),
    ), 1
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
