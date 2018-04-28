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
ezP.DelegateSvg.Manager.makeSubclass('attributeref', {
  inputs: {
    i_1: {
      key: ezP.Key.PRIMARY,
      check: ezP.T3.Expr.Check.primary,
      plugged: ezP.T3.Expr.primary,
      hole_value: 'primary',
    },
    i_2: {
      label: '.',
      edit: {
        key:ezP.Key.VALUE,
        value: '',
        placeholder: ezP.Msg.Placeholder.ATTRIBUTE,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setValue(block, this.getValue())
        },
      },
    },
  },
})


/**
 * Validate the value property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.attributeref.prototype.validateValue = function (block, newValue) {
  var type = ezP.Do.typeOfString(newValue)
  return type === ezP.T3.Expr.builtin_name || type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
  {validated: newValue}: null
}

/**
 * Synchronize the value property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.attributeref.prototype.synchronizeValue = function (block, newValue) {
  var field = this.ui.i_2.fields.value
  field.setValue(newValue || '')
}

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
    variants: [0, 1],
    i_1: {
      edit: {
        key:ezP.Key.VALUE,
        value: '',
        placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setValue(block, this.getValue())
        },
      },
    },
    i_2: {
      key: ezP.Key.PRIMARY,
      check: ezP.T3.Expr.Check.primary,
      plugged: ezP.T3.Expr.primary,
      hole_value: 'primary',
    },
    i_3: {
      key: ezP.Key.SLICE,
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
 * Validate the value property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.slicing.prototype.validateValue = function (block, newValue) {
  var type = ezP.Do.typeOfString(newValue)
  return type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
  {validated: newValue}: null
}

/**
 * Synchronize the value property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.slicing.prototype.synchronizeValue = function (block, newValue) {
  this.ui.i_1.fields.value.setValue(newValue || '')
}

/**
 * Synchronize the variant property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.slicing.prototype.synchronizeVariant = function (block, newVariant) {
  this.setInputDisabled(block, this.ui.i_1.input, !!newVariant)
  this.setInputDisabled(block, this.ui.i_2.input, !newVariant)
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.slicing.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.getVariant(block)? 1: 0
  var F = function(content, j) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setVariant(block, j)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== current)
  }
  var value = this.getValue(block)
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
ezP.DelegateSvg.Manager.makeSubclass('call_expr', {
  inputs: {
    values: ['range', 'list', 'set', 'len', 'sum'],
    i_1: {
      edit: {
        key:ezP.Key.VALUE,
        value: '',
        placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setValue(block, this.getValue())
        },
        // synchronize: function () {
        //   var block = this.sourceBlock_
        //   var ezp = block.ezp
        //   this.setValue(ezp.getValue(block) || '')
        // },
      },
    },
    i_2: {
      key: ezP.Key.PRIMARY,
      check: ezP.T3.Expr.Check.primary,
      plugged: ezP.T3.Expr.primary,
      hole_value: 'primary',
    },
    i_3: {
      key: ezP.Key.ARGUMENTS,
      start: '(',
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
})

ezP.Delegate.addInstanceProperty(ezP.DelegateSvg.Expr.call_expr, ezP.Key.BACKUP)

/**
 * Init the variant property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Expr.call_expr.prototype.initVariant = function (block) {
  this.setVariant(block, 0)
}

/**
 * Validate the variant property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.call_expr.prototype.validateVariant = function (block, newVariant) {
  return goog.isNumber(newVariant) && newVariant >= 0 && newVariant < 3 && {validated: newVariant}
}

/**
 * Synchronize the variant property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.call_expr.prototype.synchronizeVariant = function (block, newVariant) {
  var withExpression = newVariant === 1
  this.setInputDisabled(block, this.ui.i_1.input, withExpression)
  this.setInputDisabled(block, this.ui.i_2.input, !withExpression)
  var field = this.ui.i_1.fields.value
  if (field.textElement_) {
    var withBuiltin = newVariant === 2
    var i = withBuiltin? 0: 1
    var ra = ['ezp-code', 'ezp-code-reserved']
    goog.dom.classlist.remove(field.textElement_, ra[i])
    goog.dom.classlist.add(field.textElement_, ra[1-i])
  }
}

/**
 * Validate the value property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.call_expr.prototype.validateValue = function (block, newValue) {
  var type = ezP.Do.typeOfString(newValue)
  return type === ezP.T3.Expr.builtin_name || type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
  {validated: newValue}: null
}

/**
 * When the value did change.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldValue
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.call_expr.prototype.didChangeValue = function (block, oldValue, newValue) {
  var values = this.getValues(block)
  if (values) {
    var builtin = values.indexOf(newValue) >= 0
    var variant = this.getVariant(block) || 0
    this.setVariant(block, variant%2 | (builtin? 2: 0))
  }
  if (!builtin) {
    this.setBackup(block, newValue)
  }
}

/**
 * Synchronize the value property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.call_expr.prototype.synchronizeValue = function (block, newValue) {
  var field = this.ui.i_1.fields.value
  field.setValue(newValue)
  field.render_()// sometimes we do nit need to render the field
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.call_expr.populateMenu = function (block, mgr) {
  var variant = this.getVariant(block)
  var values = this.getValues(block)
  var current = this.getValue(block)
  var i = values.indexOf(current)
  if (variant !== 0) {
    var oldValue = block.ezp.getBackup(block)
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      oldValue? ezP.Do.createSPAN(oldValue, 'ezp-code'): ezP.Do.createSPAN(ezP.Msg.Placeholder.IDENTIFIER, 'ezp-code-placeholder'),
      ezP.Do.createSPAN('(…)', 'ezp-code'),
    )
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setTrustedValue(block, oldValue || '')
      block.ezp.setVariant(block, 0)
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
      block.ezp.setTrustedValue(block, values[j])
      block.ezp.setVariant(block, 2)
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
      block.ezp.setTrustedValue(block, oldValue || '')
      block.ezp.setVariant(block, 1)
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
ezP.DelegateSvg.Manager.makeSubclass('call_stmt', {
  inputs: {
    insert: ezP.T3.Expr.call_expr,
  },
})

ezP.Delegate.addInstanceProperty(ezP.DelegateSvg.Stmt.call_stmt, ezP.Key.BACKUP)

/**
 * Init the variant property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.call_stmt.prototype.initVariant = ezP.DelegateSvg.Expr.call_expr.prototype.initVariant

/**
 * Validate the variant property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.call_stmt.prototype.validateVariant = ezP.DelegateSvg.Expr.call_expr.prototype.validateVariant

/**
 * Synchronize the variant property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.call_stmt.prototype.synchronizeVariant = ezP.DelegateSvg.Expr.call_expr.prototype.synchronizeVariant

/**
 * Validate the value property.
 * The variant is true when the value is builtin, false otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.call_stmt.prototype.validateValue = ezP.DelegateSvg.Expr.call_expr.prototype.validateValue

/**
 * When the value did change.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldValue
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.call_stmt.prototype.didChangeValue = ezP.DelegateSvg.Expr.call_expr.prototype.didChangeValue

/**
 * Synchronize the value property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 */
ezP.DelegateSvg.Stmt.call_stmt.prototype.synchronizeValue = ezP.DelegateSvg.Expr.call_expr.prototype.synchronizeValue

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

ezP.DelegateSvg.Expr.call_expr.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.attributeref,
  ezP.T3.Expr.slicing,
  ezP.T3.Expr.subscription,
  ezP.T3.Expr.call_expr,
  ezP.T3.Stmt.call_stmt,
]
