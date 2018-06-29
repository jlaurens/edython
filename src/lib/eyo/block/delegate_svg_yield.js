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
      YIELD: eYo.Key.YIELD,
      YIELD_EXPRESSION: eYo.Key.YIELD_EXPRESSION,
      YIELD_FROM: eYo.Key.YIELD_FROM,
      all: [
        eYo.Key.YIELD,
        eYo.Key.YIELD_EXPRESSION,
        eYo.Key.YIELD_FROM,
      ],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var slot = this.owner_.slots.expression
        slot.required = (newValue === this.YIELD_EXPRESSION)
        slot.setIncog()
        slot = this.owner_.slots.from
        slot.required = (newValue === this.YIELD_FROM)
        slot.setIncog()
      }
    }
  },
  fields: {
    prefix: 'yield'
  },
  slots: {
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
  var D = this.data.variant
  var current = D.get()
  var F = function (content, k) {
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('yield')
  ), D.YIELD
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), D.YIELD_EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield from ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), D.YIELD_FROM
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
