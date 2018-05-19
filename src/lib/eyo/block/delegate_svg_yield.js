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

goog.provide('eYo.DelegateSvg.Yield')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, yield_expression.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('yield_expression', {
  xml: {
    tag: 'yield'
  },
  data: {
    variant: {
      YIELD: 0,
      YIELD_EXPRESSION: 1,
      YIELD_FROM: 2,
      all: [0, 1, 2],
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var M = this.model
        this.ui.tiles.expression.required = (newValue === M.YIELD_EXPRESSION)
        this.ui.tiles.from.required = (newValue === M.YIELD_FROM)
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var M = this.model
        this.ui.tiles.expression.setIncog(newValue !== M.YIELD_EXPRESSION)
        this.ui.tiles.from.setIncog(newValue !== M.YIELD_FROM)
      }
    }
  },
  fields: {
    prefix: 'yield'
  },
  tiles: {
    expression: {
      order: 1,
      wrap: eYo.T3.Expr.non_void_expression_list,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.YIELD_EXPRESSION)
        }
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from'
      },
      check: eYo.T3.Expr.Check.expression,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.YIELD_FROM)
        }
      }
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr, mgr.menu is the menu to populate.
 * @this {eYo.Delegate}
 * @private
 */
eYo.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_ = function (block, mgr) {
  if (block.eyo.locked_) {
    return
  }
  var M = this.data.variant.model
  var current = this.data.variant.get()
  var F = function (content, k) {
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('yield')
  ), M.YIELD
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), M.YIELD_EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield from ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), M.YIELD_FROM
  )
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.yield_expression.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn = eYo.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.yield_expression.superClass_.populateContextMenuFirst_.call(this, block, mgr) || yorn
}

/**
 * Class for a DelegateSvg, starred_item_list_or_yield block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('parenth_form', function () {
  var D = {
    check: eYo.T3.Expr.Check.non_void_starred_item_list,
    unique: [eYo.T3.Expr.yield_expression, eYo.T3.Expr.comprehension],
    consolidator: eYo.Consolidator.List.Singled,
    empty: true,
    presep: ',',
    hole_value: 'name'
  }
  var RA = goog.array.concat(D.check, D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    xml: {
      tag: 'parenthesis'
    },
    list: D,
    fields: {
      prefix: '(',
      suffix: ')'
    }
  }
})

/**
 * Class for a DelegateSvg, yield_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('yield_stmt', {
  link: eYo.T3.Expr.yield_expression
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.yield_expression.populateContextMenuFirst_.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.yield_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

eYo.DelegateSvg.Yield.T3s = [
  eYo.T3.Expr.yield_expression,
  eYo.T3.Stmt.yield_stmt,
  eYo.T3.Expr.term,
  eYo.T3.Expr.parenth_form
]
