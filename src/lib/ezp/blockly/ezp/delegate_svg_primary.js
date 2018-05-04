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
ezP.DelegateSvg.Expr.makeSubclass('attributeref', {
  data: {
    value: {
      default: '',
      validate: function(newValue) {
        var type = ezP.Do.typeOfString(newValue)
        return type === ezP.T3.Expr.builtin_name || type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      synchronize: function(newValue) {
        var field = this.ui[2].fields.value
        this.setFieldValue(this.toText() || '', 2, ezP.Key.VALUE)
      },
    },
  },
  tiles: {
    primary: {
      order: 1,
      check: ezP.T3.Expr.Check.primary,
      plugged: ezP.T3.Expr.primary,
      hole_value: 'primary',
    },
    attribute: {
      order: 2,
      label: '.',
      edit: {
        key: ezP.Key.VALUE,
        edit: '',
        placeholder: ezP.Msg.Placeholder.ATTRIBUTE,
        validate: function(txt) {
          return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue(), ezP.Key.VALUE)
        },
        onEndEditing: function () {
          this.ezp.setData(this.getValue(), ezP.Key.VALUE)
        },
      },
    },
  },
})

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
ezP.DelegateSvg.Expr.makeSubclass('slicing', {
  data: {
    variant: {
      all: [0, 1],
      synchronize: function(newValue) {
        this.setInputDisabled(1, !!newValue)
        this.setInputDisabled(2, !newValue)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var type = ezP.Do.typeOfString(newValue)
        return type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText() || '', 1, ezP.Key.VALUE)
      },
    }
  },
  tiles: {
    name: {
      order: 1,
      edit: {
        placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        validate: function(txt) {
          return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue(), ezP.Key.VALUE)
        },
        onEndEditing: function () {
          this.ezp.setData(this.getValue(), ezP.Key.VALUE)
        },
      },
    },
    primary: {
      order: 2,
      check: ezP.T3.Expr.Check.primary,
      plugged: ezP.T3.Expr.primary,
      hole_value: 'primary',
    },
    slice: {
      order: 3,
      start: '[',
      wrap: ezP.T3.Expr.slice_list,
      end: ']',
    },
  },
  output: {
    check: [ezP.T3.Expr.subscription, ezP.T3.Expr.slicing],
  },
})

ezP.DelegateSvg.Expr.subscription = ezP.DelegateSvg.Expr.slicing
ezP.DelegateSvg.Manager.register('subscription')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.slicing.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.data.variant.get()? 1: 0
  var F = function(content, j) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(j)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== current)
  }
  var value = this.data.value.get()
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN('[…]', 'ezp-code'),
  )
  F(content, 0)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(ezP.Msg.Placeholder.EXPRESSION, 'ezp-code-placeholder'),
    ezP.Do.createSPAN('[…]', 'ezp-code'),
  )
  F(content, 1)
  mgr.shouldSeparateInsert()
  return ezP.DelegateSvg.Expr.slicing.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

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
ezP.DelegateSvg.Expr.makeSubclass('call_expr', {
  data: {
    variant: {
      all: [0, 1, 2,],
      synchronize: function(newValue) {
        var withExpression = newValue === 1
        this.setInputDisabled(1, withExpression)
        this.setInputDisabled(2, !withExpression)
        var field = this.ui[1].fields.value
        if (field.textElement_) {
          var withBuiltin = newValue === 2
          var i = withBuiltin? 0: 1
          var ra = ['ezp-code', 'ezp-code-reserved']
          goog.dom.classlist.remove(field.textElement_, ra[i])
          goog.dom.classlist.add(field.textElement_, ra[1-i])
        }
      },
    },
    backup: {
      noUndo: true,
    },
    name: {
      all: ['range', 'list', 'set', 'len', 'sum'],
      validate: function(newValue) {
        var type = ezP.Do.typeOfString(newValue)
        return type === ezP.T3.Expr.builtin_name || type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      didChange: function(oldValue, newValue) {
        var builtin = this.getAll().indexOf(newValue) >= 0
        var variant = this.data.variant.get() || 0
        this.data.variant.set(variant%2 | (builtin? 2: 0))
        if (!builtin) {
          this.data.backup.set(newValue)
        }
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText())
      },
    },
  },
  tiles: {
    name: {
      order: 1,
      edit: {
        placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        validate: function(txt) {
          return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue())
        },
        onEndEditing: function () {
          this.ezp.setData(this.getValue())
        },
      },
    },
    primary: {
      order: 2,
      check: ezP.T3.Expr.Check.primary,
      plugged: ezP.T3.Expr.primary,
      hole_value: 'primary',
    },
    arguments: {
      order: 3,
      start: '(',
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.call_expr.populateMenu = function (block, mgr) {
  var variant = this.data.variant.get()
  var values = this.data.value.getAll()
  var current = this.data.value.get()
  var i = values.indexOf(current)
  if (variant !== 0) {
    var oldValue = block.ezp.data.backup.get()
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      oldValue? ezP.Do.createSPAN(oldValue, 'ezp-code'): ezP.Do.createSPAN(ezP.Msg.Placeholder.IDENTIFIER, 'ezp-code-placeholder'),
      ezP.Do.createSPAN('(…)', 'ezp-code'),
    )
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.value.setTrusted(oldValue || '')
      block.ezp.data.variant.set(0)
    })
    mgr.addChild(menuItem, true)
  }
  var F = function(j) {
    // closure to catch j
    content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN(values[j], 'ezp-code-reserved'),
      ezP.Do.createSPAN('(…)', 'ezp-code'),
    )
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.value.setTrusted(values[j])
      block.ezp.data.variant.set(2)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== i)
  }
  for (var j = 0; j < values.length; j++) {
    F (j)
  }
  if (variant !== 1) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN(ezP.Msg.Placeholder.EXPRESSION, 'ezp-code-placeholder'),
      ezP.Do.createSPAN('(…)', 'ezp-code'),
    )
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.value.setTrusted(oldValue || '')
      block.ezp.data.variant.set(1)
    })
    mgr.addChild(menuItem, true)
  }
  mgr.shouldSeparateInsert()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return ezP.DelegateSvg.Expr.call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('call_stmt', {
  link: ezP.T3.Expr.call_expr,
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return ezP.DelegateSvg.Stmt.call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

ezP.DelegateSvg.Primary.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.attributeref,
  ezP.T3.Expr.slicing,
  ezP.T3.Expr.subscription,
  ezP.T3.Expr.call_expr,
  ezP.T3.Stmt.call_stmt,
]
