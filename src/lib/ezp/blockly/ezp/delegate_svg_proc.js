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

goog.require('ezP.DelegateSvg.Term')
goog.require('ezP.DelegateSvg.Group')
goog.require('ezP.MenuItem')

// /**
//  * Class for a DelegateSvg, dotted_funcname_solid block.
//  * For ezPython.
//  * @param {?string} prototypeName Name of the language object containing
//  *     type-specific functions for this block.
//  * @constructor
//  */
// ezP.DelegateSvg.Manager.makeSubclass('dotted_funcname_solid', {
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
 * Class for a DelegateSvg, decorator.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp:decorator",
ezP.DelegateSvg.Manager.makeSubclass('decorator', {
  inputs: {
    builtins: ['staticmethod', 'classmethod'],
    variants: [ezP.Key.DOTTED_NAME, ezP.Key.BUILTIN, ezP.Key.ARGUMENTS],
    subtypes: [ezP.T3.Expr.dotted_name, ezP.T3.Expr.identifier],
    prefix: {
      label: '@',
      css_class: 'ezp-code-reserved',
    },
    i_1: {
      term: {
        key: ezP.Key.DOTTED_NAME,
        value: '',
        placeholder: ezP.Msg.Placeholder.DECORATOR,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, goog.isDef(txt) && txt || this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setValue(block, this.getValue())
        },
        left_space: true,
      },
    },
    i_2: {
      key: ezP.Key.BUILTIN,
      label: '',
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
ezP.Do.addInstanceProperty(ezP.DelegateSvg.Stmt.decorator, ezP.Key.BUILTIN)

/**
 * Synchronize the UI after a variant change.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.decorator.prototype.synchronizeVariant = function (block, variant) {
  this.setNamedInputDisabled(block, ezP.Key.DOTTED_NAME, variant === ezP.Key.BUILTIN)
  this.setNamedInputDisabled(block, ezP.Key.BUILTIN, variant !== ezP.Key.BUILTIN)
  this.setNamedInputDisabled(block, ezP.Key.ARGUMENTS, variant !== ezP.Key.ARGUMENTS)
}

/**
 * Synchronize the UI after a builtin change.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.decorator.prototype.synchronizeBuiltin = function (block, builtin) {
  this.ui.i_2.fields.label.setValue(builtin || '')
}

/**
 * Init the value.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.decorator.prototype.initValue = function (block) {
  this.setValue(block, this.ui.i_1.fields.dotted_name.getValue())
}

/**
 * Synchronize the ui after the value change.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.decorator.prototype.synchronizeValue = function (block, value) {
  this.ui.i_1.fields.dotted_name.setValue(value || '')
}

/**
 * Validates the new value.
 * The type must be one of `dotted_name` or `identifier`.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.decorator.prototype.validateValue = function (block, newValue) {
  var subtypes = this.getSubtypes(block)
  var subtype = ezP.Do.typeOfString(newValue)
  return (subtypes.indexOf(subtype)>= 0) && {validated: newValue} || null
}

/**
 * decorator blocks are white when followed by a statement.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.Stmt.decorator.prototype.isWhite = function (block) {
  return block.nextConnection.isConnected()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Stmt.decorator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var value = this.getValue(block)
  var builtin = this.getBuiltin(block)
  var builtins = this.getBuiltins(block)
  var i_b = builtins.indexOf(builtin)
  var variant = this.getVariant(block)
  var variants = this.getVariants(block)
  var i_v = variants.indexOf(variant)
  if (variant === ezP.Key.BUILTIN) {

  }
  var menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+builtins[0], 'ezp-code-reserved'),
      function() {
    block.ezp.setBuiltin(block, 0)
    block.ezp.setVariant(block, 1)
  })
  menuItem.setEnabled(i_b != 0 || i_v != 1)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+builtins[1], 'ezp-code-reserved'),
      function() {
    block.ezp.setBuiltin(block, 1)
    block.ezp.setVariant(block, 1)
  })
  menuItem.setEnabled(i_b != 1 || i_v != 1)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN(value || ezP.Msg.Placeholder.DECORATOR, !value && 'ezp-code-placeholder'),
    ),
      function() {
    block.ezp.setVariant(block, 0)
  })
  menuItem.setEnabled(i_v !== 0)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN(value || ezP.Msg.Placeholder.DECORATOR, !value && 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)')
    ),
      function() {
    block.ezp.setVariant(block, 2)
  })
  menuItem.setEnabled(i_v !== 2)
  mgr.addChild(menuItem)
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.decorator.superClass_.populateContextMenuFirst_.call(this, block, mgr)
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
    variants: ['', ezP.Key.TYPE],
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
 * Synchronize the variant with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.funcdef_part.prototype.synchronizeVariant = function (block) {
  this.setNamedInputDisabled(block, ezP.Key.TYPE, (ezP.Key.TYPE !== this.getVariant(block)))
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.getVariants(block)
  var variant = block.ezp.getVariant(block)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setVariant(block, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…) -> …'),
  ), variants[1])
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
    variants: [null, ezP.Key.ARGUMENTS],
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
 * Synchronize the variant with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.synchronizeVariant = function (block) {
  
  block.ezp.setNamedInputDisabled(block, ezP.Key.ARGUMENTS, (ezP.Key.ARGUMENTS !== this.getVariant(block)))
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = block.ezp.getModel().inputs.variants
  var variant = block.ezp.getVariant(block)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setVariant(block, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
  ), variants[1])
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

ezP.DelegateSvg.Proc.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Stmt.decorator,
  ezP.T3.Stmt.funcdef_part,
  ezP.T3.Stmt.classdef_part,
]