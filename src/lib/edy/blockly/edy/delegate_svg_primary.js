/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for edython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.DelegateSvg.Primary')

goog.require('edY.DelegateSvg.Expr')


/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('attributeref', {
  data: {
    attribute: {
      default: '',
      validate: function(newValue) {
        var type = edY.Do.typeOfString(newValue)
        return type === edY.T3.Expr.builtin_name || type === edY.T3.Expr.identifier || type === edY.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      synchronize: true,
    },
  },
  tiles: {
    primary: {
      order: 1,
      check: edY.T3.Expr.Check.primary,
      plugged: edY.T3.Expr.primary,
      hole_value: 'primary',
    },
    attribute: {
      order: 2,
      fields: {
        label: '.',
        edit: {
          validate: true,
          endEditing: true,
          placeholder: edY.Msg.Placeholder.ATTRIBUTE,
        },
      },
    },
  },
})

/**
 * Class for a DelegateSvg, subscription and slicing.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('slicing', {
  data: {
    variant: { // data named 'variant' have `xml = false`, by default
      all: [0, 1],
      synchronize: function(newValue) {
        this.ui.tiles.name.setIncog(!!newValue)
        this.ui.tiles.primary.setIncog(!newValue)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var type = edY.Do.typeOfString(newValue)
        return type === edY.T3.Expr.identifier || type === edY.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      synchronize: true,
    }
  },
  tiles: {
    name: {
      order: 1,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: edY.Msg.Placeholder.IDENTIFIER,
        },
      },
    },
    primary: {
      order: 2,
      check: edY.T3.Expr.Check.primary,
      plugged: edY.T3.Expr.primary,
      hole_value: 'primary',
    },
    slice: {
      order: 3,
      fields: {
        start: '[',
        end: ']',
      },
      wrap: edY.T3.Expr.slice_list,
    },
  },
  output: {
    check: [edY.T3.Expr.subscription, edY.T3.Expr.slicing],
  },
})

edY.DelegateSvg.Expr.subscription = edY.DelegateSvg.Expr.slicing
edY.DelegateSvg.Manager.register('subscription')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Expr.slicing.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.data.variant.get()? 1: 0
  var F = function(content, j) {
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.variant.set(j)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== current)
  }
  var name = this.data.name.get()
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN(name || edY.Msg.Placeholder.IDENTIFIER, name? 'edy-code': 'edy-code-placeholder'),
    edY.Do.createSPAN('[…]', 'edy-code'),
  )
  F(content, 0)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN(edY.Msg.Placeholder.EXPRESSION, 'edy-code-placeholder'),
    edY.Do.createSPAN('[…]', 'edy-code'),
  )
  F(content, 1)
  mgr.shouldSeparateInsert()
  return edY.DelegateSvg.Expr.slicing.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('call_expr', {
  data: {
    variant: {
      NAME: 0,
      BUILTIN: 1,
      EXPRESSION: 2,
      all: [0, 1, 2,],
      synchronize: function(newValue) {
        var M = this.model
        var withExpression = newValue === M.EXPRESSION
        this.data.name.setIncog(withExpression)
        this.data.name.required = newValue === M.NAME
        this.ui.tiles.expression.setIncog(!withExpression)
        this.ui.tiles.expression.required = withExpression
      },
    },
    backup: {
      noUndo: true,
      xml: false,
    },
    name: {
      all: ['range', 'list', 'set', 'len', 'sum'],
      validate: function(newValue) {
        if (newValue === 'range') {
          console.log('validating range')
        }
        var type = edY.Do.typeOfString(newValue)
        console.log(type, newValue)
        return type === edY.T3.Expr.builtin_name || type === edY.T3.Expr.identifier || type === edY.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      didChange: function(oldValue, newValue) {
        var M = this.data.variant.model
        var variant = this.data.variant.get()
        var builtin = this.getAll().indexOf(newValue) >= 0
        if (variant !== M.EXPRESSION) {
          var variant = this.data.variant.get() || 0
          this.data.variant.set(builtin? M.BUILTIN: M.NAME)
        }
        if (!builtin) {
          this.data.backup.set(newValue)
        }
      },
      synchronize: function () {
        this.synchronize()
        var field = this.field
        var element = this.field && this.field.textElement_
        if (element) {
          var variant = this.data.variant
          var i = variant.get() == variant.model.BUILTIN? 0: 1
          var ra = ['edy-code', 'edy-code-reserved']
          goog.dom.classlist.remove(element, ra[i])
          goog.dom.classlist.add(element, ra[1-i])
        }
      },
      consolidate: function () {
        this.didChange(undefined, this.get())
      },
    },
  },
  fields: {
    name: {
      validate: true,
      endEditing: true,
      placeholder: edY.Msg.Placeholder.IDENTIFIER,
    },
  },
  tiles: {
    expression: {
      order: 1,
      check: edY.T3.Expr.Check.primary,
      plugged: edY.T3.Expr.primary,
      hole_value: 'primary',
      xml: {
        didLoad: function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.EXPRESSION)
        },
      },
    },
    arguments: {
      order: 1,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: edY.T3.Expr.argument_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Expr.call_expr.populateMenu = function (block, mgr) {
  var M = this.data.variant.model
  var variant = this.data.variant.get()
  var names = this.data.name.getAll()
  var current = this.data.name.get()
  var i = names.indexOf(current)
  if (variant !== 0) {
    var oldValue = block.edy.data.backup.get()
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      oldValue? edY.Do.createSPAN(oldValue, 'edy-code'): edY.Do.createSPAN(edY.Msg.Placeholder.IDENTIFIER, 'edy-code-placeholder'),
      edY.Do.createSPAN('(…)', 'edy-code'),
    )
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.name.setTrusted(oldValue || '')
      block.edy.data.variant.set(M.NAME)
    })
    mgr.addChild(menuItem, true)
  }
  var F = function(j) {
    // closure to catch j
    content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN(names[j], 'edy-code-reserved'),
      edY.Do.createSPAN('(…)', 'edy-code'),
    )
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.name.setTrusted(names[j])
      block.edy.data.variant.set(M.BUILTIN)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== i)
  }
  for (var j = 0; j < names.length; j++) {
    F (j)
  }
  if (variant !== M.EXPRESSION) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      edY.Do.createSPAN(edY.Msg.Placeholder.EXPRESSION, 'edy-code-placeholder'),
      edY.Do.createSPAN('(…)', 'edy-code'),
    )
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.name.setTrusted(oldValue || '')
      block.edy.data.variant.set(M.EXPRESSION)
    })
    mgr.addChild(menuItem, true)
  }
  mgr.shouldSeparateInsert()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Expr.call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  edY.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return edY.DelegateSvg.Expr.call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Stmt.makeSubclass('call_stmt', {
  link: edY.T3.Expr.call_expr,
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  edY.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return edY.DelegateSvg.Stmt.call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

edY.DelegateSvg.Primary.T3s = [
  edY.T3.Expr.term,
  edY.T3.Expr.attributeref,
  edY.T3.Expr.slicing,
  edY.T3.Expr.subscription,
  edY.T3.Expr.call_expr,
  edY.T3.Stmt.call_stmt,
]
