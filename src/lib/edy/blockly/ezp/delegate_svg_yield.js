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

goog.provide('ezP.DelegateSvg.Yield')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')

/**
 * Class for a DelegateSvg, yield_expression.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('yield_expression', {
  xml: {
    tag: 'yield',
  },
  data: {
    variant: {
      YIELD: 0,
      YIELD_EXPRESSION: 1,
      YIELD_FROM: 2,
      all: [0, 1, 2],
      didChange: function(oldValue, newValue) {
        var M = this.model
        this.ui.tiles.expression.required = (newValue == M.YIELD_EXPRESSION)
        this.ui.tiles.from.required = (newValue == M.YIELD_FROM)
      },
      synchronize: function(newValue) {
        var M = this.model
        this.ui.tiles.expression.setIncog(newValue != M.YIELD_EXPRESSION)
        this.ui.tiles.from.setIncog(newValue != M.YIELD_FROM)
      },
    },
  },
  fields: {
    prefix: 'yield',
  },
  tiles: {
    expression: {
      order: 1,
      wrap: ezP.T3.Expr.non_void_expression_list,
      xml: {
        didLoad: function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.YIELD_EXPRESSION)
        },
      },
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
      },
      check: ezP.T3.Expr.Check.expression,
      xml: {
        didLoad: function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.YIELD_FROM)
        }
      }
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_ = function (block, mgr) {
  if (block.ezp.locked_) {
    return
  }
  var M = this.data.variant.model
  var current = this.data.variant.get()
  var F = function(content, k) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('yield'),
    ), M.YIELD
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('yield ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), M.YIELD_EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('yield from ', 'ezp-code-reserved'),
      goog.dom.createTextNode('…'),
    ), M.YIELD_FROM
  )
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.yield_expression.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_.call(this, block, mgr)
  return ezP.DelegateSvg.Expr.yield_expression.superClass_.populateContextMenuFirst_.call(this,block, mgr) || yorn
}


/**
 * Class for a DelegateSvg, starred_item_list_or_yield block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('parenth_form', function() {
  var D = {
    check: ezP.T3.Expr.Check.non_void_starred_item_list,
    unique: [ezP.T3.Expr.yield_expression, ezP.T3.Expr.comprehension,],
    consolidator: ezP.Consolidator.List.Singled,
    empty: true,
    presep: ',',
    hole_value: 'name',
  }
  var RA = goog.array.concat(D.check,D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    xml: {
      tag: 'parenthesis',
    },
    list: D,
    fields: {
      prefix: '(',
      suffix: ')',
    },
  }
})

/**
 * Class for a DelegateSvg, yield_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('yield_stmt', {
  link: ezP.T3.Expr.yield_expression,
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_.call(this, block, mgr)
  return ezP.DelegateSvg.Stmt.yield_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

ezP.DelegateSvg.Yield.T3s = [
  ezP.T3.Expr.yield_expression,
  ezP.T3.Stmt.yield_stmt,
  ezP.T3.Expr.term,
  ezP.T3.Expr.parenth_form,
]