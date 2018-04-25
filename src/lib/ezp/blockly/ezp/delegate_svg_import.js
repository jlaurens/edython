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

goog.provide('ezP.DelegateSvg.Import')

goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')

/////////////////     module_as      ///////////////////
/*
import_module ::= "import" non_void_module_as_list
non_void_module_as_list ::= module_as ( "," module_as )*
# module_as is not just an identifier, to simplify the UI management
# module might represent here an object from a python module
module_as ::= module ["as" identifier]
module ::= module_name ['.' module]
#name  ::=  identifier
name ::= IGNORE
module_name ::= identifier
*/

/**
 * Class for a DelegateSvg, non_void_module_as_list block.
 * This block may be wrapped.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('non_void_module_as_list', {
  inputs: {
    list: {
      check: ezP.T3.Expr.Check.non_void_module_as_list,
      empty: false,
      sep: ',',
      hole_value: 'module',
    },
  },
})

/**
 * Class for a DelegateSvg, non_void_import_identifier_as_list block.
 * This block may be wrapped.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('non_void_import_identifier_as_list', {
  inputs: {
    list: {
      check: ezP.T3.Expr.Check.non_void_import_identifier_as_list,
      empty: false,
      sep: ',',
      hole_value: 'name',
    },
  },
})


/////////////////     import_stmt      ///////////////////

/**
 * Class for a DelegateSvg, import_stmt.
 * The value property is used to store the module.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
 console.warn('Is the edit: below complete?')
ezP.DelegateSvg.Manager.makeSubclass('import_stmt', {
  inputs: {
    variants: [0, 1, 2],
    i_1: {
      label: 'import',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.IMPORT_MODULE,
      wrap: ezP.T3.Expr.non_void_module_as_list,
    },
    i_2: {
      label: 'from',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.FROM,
      check: ezP.T3.Expr.Check.relative_module,
      plugged: ezP.T3.Expr.relative_module,
      hole_value: 'module',
      edit: {
        key:ezP.Key.FROM,
        value: '',
        placeholder: ezP.Msg.Placeholder.MODULE,
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
    i_3: {
      label: 'import',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.IMPORT,
      wrap: ezP.T3.Expr.non_void_import_identifier_as_list,
    },
    i_4: {
      label: 'import *',
      css_class: 'ezp-code-reserved',
    },
  },
})

/**
 * Validate the value property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.validateValue = function (block, newValue) {
  var type = ezP.Do.typeOfString(newValue)
  var variant = this.getVariant(block)
  return type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name || variant === 1 && (type === ezP.T3.Expr.parent_module)?
  {validated: newValue}: null
}

/**
 * Validate the value property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.synchronizeValue = function (block, newValue) {
  this.ui.i_2.fields.from.setValue(newValue || '')
}

console.log('When read from dom, if the read data is not valid, what to do?')

/**
 * Validates the new variant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.validateVariant = function (block, newVariant) {
  return goog.isNumber(newVariant) && 0 <= newVariant && newVariant < 3 && {validated: newVariant} || null
}

/**
 * Validates the new variant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.didChangeVariant = function (block, newVariant) {
  this.setSubtype(block, newVariant === 1? 0: 1)
}

/**
 * synchronize the variant with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.synchronizeVariant = function (block, newVariant) {
  var disabled_1 = true, disabled_2 = true, disabled_3 = true, disabled_4 = true
  switch(newVariant) {
    case 0:
    disabled_1 = false
    break
    case 1:
    disabled_2 = false
    disabled_3 = false
    break
    case 2:
    disabled_2 = false
    disabled_4 = false
    break
  }
  this.setInputDisabled(block, this.ui.i_1.input, disabled_1)
  this.setInputDisabled(block, this.ui.i_2.input, disabled_2)
  this.setInputDisabled(block, this.ui.i_3.input, disabled_3)
  this.setInputDisabled(block, this.ui.i_4.input, disabled_4)
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.ezp.getVariant(block)
  var F = function(content, variant) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setVariant(block, variant)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(variant !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('import ', 'ezp-code-reserved'),
    ezP.Do.createSPAN('module', 'ezp-code-placeholder'),
    goog.dom.createTextNode(' ['),
    ezP.Do.createSPAN('as', 'ezp-code-reserved'),
    goog.dom.createTextNode(' ...]'),
  ), 0)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('from ', 'ezp-code-reserved'),
    ezP.Do.createSPAN('module ', 'ezp-code-placeholder'),
    ezP.Do.createSPAN('import ', 'ezp-code-reserved'),
    goog.dom.createTextNode('… ['),
    ezP.Do.createSPAN('as', 'ezp-code-reserved'),
    goog.dom.createTextNode(' …]'),
  ), 1)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('from ', 'ezp-code-reserved'),
    ezP.Do.createSPAN('module ', 'ezp-code-placeholder'),
    ezP.Do.createSPAN('import *', 'ezp-code-reserved'),
  ), 2)
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.import_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/////////// future
// This is expected to disappear soon
/**
 * Class for a DelegateSvg, future_statement.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('future_statement', {
  inputs: {
    i_1: {
      label: 'from __future__ import',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.LIST,
      wrap: ezP.T3.Expr.non_void_import_identifier_as_list,
    },
  },
})

ezP.DelegateSvg.Import.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.non_void_module_as_list,
  ezP.T3.Expr.non_void_import_identifier_as_list,
  ezP.T3.Stmt.import_stmt,
  ezP.T3.Stmt.future_statement,  
]