/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Primary')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Expr')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('attributeref', {
  data: {
    attribute: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin_name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
      },
      synchronize: true
    }
  },
  slots: {
    primary: {
      order: 1,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary'
    },
    attribute: {
      order: 2,
      fields: {
        label: '.',
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.ATTRIBUTE
        }
      }
    }
  }
})

/**
 * Class for a DelegateSvg, subscription and slicing.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('slicing', {
  data: {
    variant: { // data named 'variant' have `xml = false`, by default
      all: [0, 1],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.owner_.slots.name.setIncog(!!newValue)
        this.owner_.slots.primary.setIncog(!newValue)
      }
    },
    name: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
      },
      synchronize: true
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER
        }
      }
    },
    primary: {
      order: 2,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary'
    },
    slice: {
      order: 3,
      fields: {
        start: '[',
        end: ']'
      },
      wrap: eYo.T3.Expr.slice_list
    }
  },
  output: {
    check: [eYo.T3.Expr.subscription, eYo.T3.Expr.slicing]
  }
})

eYo.DelegateSvg.Expr.subscription = eYo.DelegateSvg.Expr.slicing
eYo.DelegateSvg.Manager.register('subscription')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.slicing.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.data.variant.get() ? 1 : 0
  var F = function (content, j) {
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.variant.set(j)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== current)
  }
  var name = this.data.name.get()
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name ? 'eyo-code' : 'eyo-code-placeholder'),
    eYo.Do.createSPAN('[…]', 'eyo-code')
  )
  F(content, 0)
  content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
    eYo.Do.createSPAN('[…]', 'eyo-code')
  )
  F(content, 1)
  mgr.shouldSeparateInsert()
  return eYo.DelegateSvg.Expr.slicing.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('call_expr', {
  data: {
    variant: {
      NAME: 0,
      BUILTIN: 1,
      EXPRESSION: 2,
      all: [0, 1, 2],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var M = this.model
        var withExpression = newValue === M.EXPRESSION
        this.data.name.setIncog(withExpression)
        this.data.name.required = newValue === M.NAME
        this.owner_.slots.expression.setIncog(!withExpression)
        this.owner_.slots.expression.required = withExpression
      }
    },
    backup: {
      noUndo: true,
      xml: false
    },
    name: {
      all: ['list', 'set', 'len', 'sum'],
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin_name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var M = this.data.variant.model
        var variant = this.data.variant.get()
        var builtin = this.getAll().indexOf(newValue) >= 0
        if (variant !== M.EXPRESSION) {
          variant = this.data.variant.get() || 0
          this.data.variant.set(builtin ? M.BUILTIN : M.NAME)
        }
        if (!builtin) {
          this.data.backup.set(newValue)
        }
      },
      synchronize: /** @suppress {globalThis} */ function () {
        this.synchronize()
        var field = this.field
        var element = field && field.textElement_
        if (element) {
          var variant = this.data.variant
          var i = variant.get() === variant.model.BUILTIN ? 0 : 1
          var ra = ['eyo-code', 'eyo-code-reserved']
          goog.dom.classlist.remove(element, ra[i])
          goog.dom.classlist.add(element, ra[1 - i])
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    }
  },
  fields: {
    name: {
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER
    }
  },
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.EXPRESSION)
        }
      }
    },
    arguments: {
      order: 1,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.call_expr.populateMenu = function (block, mgr) {
  var M = this.data.variant.model
  var variant = this.data.variant.get()
  var names = this.data.name.getAll()
  var current = this.data.name.get()
  var i = names.indexOf(current)
  if (variant !== 0) {
    var oldValue = block.eyo.data.backup.get()
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      oldValue ? eYo.Do.createSPAN(oldValue, 'eyo-code') : eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.name.setTrusted(oldValue || '')
      block.eyo.data.variant.set(M.NAME)
    })
    mgr.addChild(menuItem, true)
  }
  var F = function (j) {
    // closure to catch j
    content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(names[j], 'eyo-code-reserved'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.name.setTrusted(names[j])
      block.eyo.data.variant.set(M.BUILTIN)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== i)
  }
  for (var j = 0; j < names.length; j++) {
    F(j)
  }
  if (variant !== M.EXPRESSION) {
    content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.name.setTrusted(oldValue || '')
      block.eyo.data.variant.set(M.EXPRESSION)
    })
    mgr.addChild(menuItem, true)
  }
  mgr.shouldSeparateInsert()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('call_stmt', {
  link: eYo.T3.Expr.call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

eYo.DelegateSvg.Primary.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Expr.attributeref,
  eYo.T3.Expr.slicing,
  eYo.T3.Expr.subscription,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt
]
