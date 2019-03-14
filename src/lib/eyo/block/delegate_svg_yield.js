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

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, yield_expr.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('yield_expr', {
  xml: {
    attr: 'yield'
  },
  data: {
    variant: {
      all: [
        eYo.Key.NONE,
        eYo.Key.EXPRESSION,
        eYo.Key.FROM,
      ],
      init: eYo.Key.NONE,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.expression_s
        slot.required = (newValue === eYo.Key.EXPRESSION)
        slot.setIncog()
        var d = this.owner.from_d
        d.required = (newValue === eYo.Key.FROM)
        d.setIncog()
      },
      xml: false
    },
    from: {
      init: '',
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.owner.variant_p !== eYo.Key.NONE
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.FROM
        }
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
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.EXPRESSION
        }
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        bind: {
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.EXPRESSION
        }
      },
      check: eYo.T3.Expr.Check.expression,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.FROM
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr, mgr.menu is the menu to populate.
 * @this {eYo.Delegate}
 * @private
 */
eYo.DelegateSvg.Expr.yield_expr.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  if (block.eyo.locked_) {
    return
  }
  var current = this.variant_p
  var F = (content, k) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = k
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('yield')
  ), eYo.Key.NONE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.Key.EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('yield from ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.Key.FROM
  )
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.yield_expr.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var yorn = eYo.DelegateSvg.Expr.yield_expr.populateContextMenuFirst_.call(this, mgr)
  return eYo.DelegateSvg.Expr.yield_expr.superClass_.populateContextMenuFirst_.call(this, mgr) || yorn
}

/**
 * Class for a DelegateSvg, yield_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('yield_stmt', {
  link: eYo.T3.Expr.yield_expr
}, true)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr, mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.yield_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  eYo.DelegateSvg.Expr.yield_expr.populateContextMenuFirst_.call(this, mgr)
  return eYo.DelegateSvg.Stmt.yield_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

eYo.DelegateSvg.Yield.T3s = [
  eYo.T3.Expr.yield_expr,
  eYo.T3.Stmt.yield_stmt,
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.parenth_form
]
