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

goog.provide('ezP.DelegateSvg.Proc')

goog.require('ezP.DelegateSvg.Group')
goog.require('ezP.MenuItem')

// /**
//  * Class for a DelegateSvg, dotted_funcname_concrete block.
//  * For ezPython.
//  * @param {?string} prototypeName Name of the language object containing
//  *     type-specific functions for this block.
//  * @constructor
//  */
// ezP.DelegateSvg.Manager.makeSubclass('dotted_funcname_concrete', {
//   inputs: {
//     i_1: {
//       key: ezP.Key.PARENT,
//       check: ezP.T3.Expr.identifier,
//       hole_value: 'parent',
//     },
//     i_3: {
//       label: '.',
//       key: ezP.Key.NAME,
//       check: ezP.T3.Expr.dotted_name,
//       hole_value: 'name',
//     },
//   },
// })
// console.warn('implement the statement')
/**
 * Class for a DelegateSvg, decorator_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator_stmt            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp:decorator_stmt",
ezP.DelegateSvg.Manager.makeSubclass('decorator_stmt', {
  inputs: {
    values: [null, 'staticmethod', 'classmethod'],
    subtypes: [null, ezP.Key.ARGUMENTS],
    prefix: {
      label: '@',
      css_class: 'ezp-code-reserved',
    },
    i_1: {
      dotted_name: '',
      hole_value: 'decorator',
    },
    i_2: {
      key: ezP.Key.BUILTIN,
      label: 'staticmethod',
      css_class: 'ezp-code-reserved',
    },
    i_3: {
      start: '(',
      key: ezP.Key.ARGUMENTS,
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
  statement: {
    next: {
      required: true,
    }
  }
})

/**
 * Hook after the subtype change.
 * Default implementation does nothing.
 * Subclassers will take care of undo compliance.
 * Event recording is disabled.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.didChangeValueOrSubtype = function (block, value, subtype) {
  var values = this.getModel().inputs.values
  var named = values.indexOf(value) < 1
  this.setNamedInputDisabled(block, ezP.Key.DOTTED_NAME, !named)
  this.setNamedInputDisabled(block, ezP.Key.BUILTIN, named)
  this.setNamedInputDisabled(block, ezP.Key.ARGUMENTS, !named || (ezP.Key.ARGUMENTS != subtype))
  this.ui.i_1.fields.value.setValue(value || '')
  this.ui.i_2.fields.label.setValue(value || '')
}

/**
 * Hook after the subtype change.
 * Default implementation does nothing.
 * Subclassers will take care of undo compliance.
 * Event recording is disabled.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.decorator_stmt.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  this.didChangeValueOrSubtype(block, this.getValue(block), newSubtype)
}

/**
 * Hook after the Value change.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.didChangeValue = function (block, oldValue, newValue) {
  ezP.DelegateSvg.Stmt.decorator_stmt.superClass_.didChangeValue.call(this, block, oldValue, newValue)
  this.didChangeValueOrSubtype(block, newValue, this.getSubtype(block))
}

/**
 * Validates the new value.
 * The type must be one of `dotted_name` or `identifier`.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.validateValue = function (block, newValue) {
  var type = ezP.Do.typeOfString(newValue)
  return (type === ezP.T3.Expr.dotted_name || type === ezP.T3.Expr.identifier) && {validated: newSubtype}
}
console.warn('onEndEditing below')
/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.endEditingField = function (block, field) {
  this.setValue(block, field.getValue())
}

/**
 * decorator blocks are white when followed by a statement.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.isWhite = function (block) {
  return block.nextConnection.isConnected()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var inputs = block.ezp.getModel().inputs
  var value = this.getValue(block)
  var values = inputs.values
  var named = values.indexOf(value) < 1
  var subtype = this.getSubtype(block)
  var subtypes = inputs.subtypes
  var menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN('decorator', 'ezp-code-placeholder'),
    ),
      function() {
    block.ezp.setValue(block, values[0])
  })
  menuItem.setEnabled(values[0] != value)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+values[1], 'ezp-code-reserved'),
      function() {
    block.ezp.setValue(block, values[1])
  })
  menuItem.setEnabled(values[1] != value)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+values[2], 'ezp-code-reserved'),
      function() {
    block.ezp.setValue(block, values[2])
  })
  menuItem.setEnabled(values[2] != value)
  mgr.addChild(menuItem)
  mgr.shouldSeparate()
  if (named) {
    menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        ezP.Do.createSPAN('@', 'ezp-code-reserved'),
        value? goog.dom.createTextNode(value): ezP.Do.createSPAN('decorator', 'ezp-code-placeholder'),
      ), function() {
      block.ezp.setSubtype(block, subtypes[0])
    })
    menuItem.setEnabled(subtypes[0] != subtype)
    mgr.addChild(menuItem)
    menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        ezP.Do.createSPAN('@', 'ezp-code-reserved'),
        value? goog.dom.createTextNode(value): ezP.Do.createSPAN('decorator', 'ezp-code-placeholder'),
        goog.dom.createTextNode('(…)'),
      ), function() {
      block.ezp.setSubtype(block, subtypes[1])
    })
    menuItem.setEnabled(subtypes[1] != subtype)
    mgr.addChild(menuItem)
    mgr.shouldSeparate()
  }
  return ezP.DelegateSvg.Stmt.decorator_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, funcdef_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
 // funcdef_part ::= ["async"] "def" funcname "(" [parameter_list] ")" ["->" expression] ":" SUITE

ezP.DelegateSvg.Manager.makeSubclass('funcdef_part', {
  inputs: {
    subtypes: ['', ezP.Key.TYPE],
    i_1: {
      key: ezP.Key.NAME,
      label: 'def',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
    },
    i_2: {
      key: ezP.Key.PARAMETERS,
      start: '(',
      wrap: ezP.T3.Expr.parameter_list,
      end: ')',
    },
    i_3: {
      label: '->',
      key: ezP.Key.TYPE,
      check: ezP.T3.Expr.Check.expression,
    },
  },
}, ezP.DelegateSvg.Group)

/**
 * Hook after the subtype change.
 * Default implementation does nothing.
 * Subclassers will take care of undo compliance.
 * Event recording is disabled.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Stmt.funcdef_part.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.funcdef_part.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  block.ezp.setNamedInputDisabled(block, ezP.Key.TYPE, (ezP.Key.TYPE !== newSubtype))
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var subtypes = block.ezp.getModel().inputs.subtypes
  var subtype = block.ezp.getSubtype(block)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setSubtype(block, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== subtype)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
    ), subtypes[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…) -> …'),
  ), subtypes[1])
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.funcdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/*
classdef_part ::=  "class" classname [parenth_argument_list] ':'
*/

/**
 * Class for a DelegateSvg, classdef_part block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('classdef_part', {
  inputs: {
    subtypes: [null, ezP.Key.ARGUMENTS],
    i_1: {
      key: ezP.Key.NAME,
      label: 'class',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
    },
    i_2: {
      key: ezP.Key.ARGUMENTS,
      start: '(',
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
}, ezP.DelegateSvg.Group)


/**
 * Hook after the subtype change.
 * Default implementation does nothing.
 * Subclassers will take care of undo compliance.
 * Event recording is disabled.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.classdef_part.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  block.ezp.setNamedInputDisabled(block, ezP.Key.ARGUMENTS, (ezP.Key.ARGUMENTS !== newSubtype))
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var subtypes = block.ezp.getModel().inputs.subtypes
  var subtype = block.ezp.getSubtype(block)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setSubtype(block, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== subtype)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
    ), subtypes[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
  ), subtypes[1])
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

ezP.DelegateSvg.Proc.T3s = [
  ezP.T3.Expr.dotted_name,
  ezP.T3.Stmt.decorator_stmt,
  ezP.T3.Stmt.funcdef_part,
  ezP.T3.Stmt.classdef_part,
]