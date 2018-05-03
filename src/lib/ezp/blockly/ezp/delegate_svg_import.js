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
ezP.DelegateSvg.List.makeSubclass('non_void_module_as_list', {
  list: {
    check: ezP.T3.Expr.Check.non_void_module_as_list,
    empty: false,
    presep: ',',
    hole_value: 'module',
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
ezP.DelegateSvg.List.makeSubclass('non_void_import_identifier_as_list', {
  list: {
    check: ezP.T3.Expr.Check.non_void_import_identifier_as_list,
    empty: false,
    presep: ',',
    hole_value: 'name',
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
ezP.DelegateSvg.Stmt.makeSubclass('import_stmt', {
  data: {
    variant: {
      all: [0, 1, 2],
      synchronize: function(newValue) {
        // var disabled_1 = true, disabled_2 = true, disabled_3 = true, disabled_4 = true
        // switch(newValue) {
        //   case 0: disabled_1 = false; break
        //   case 1: disabled_2 = disabled_3 = false; break
        //   case 2: disabled_2 = disabled_4 = false; break
        // }
        // this.setInputDisabled(1, disabled_1)
        // this.setInputDisabled(2, disabled_2)
        // this.setInputDisabled(3, disabled_3)
        // this.setInputDisabled(4, disabled_4)
        this.setInputDisabled(1, newValue != 0)
        this.setInputDisabled(2, newValue == 0)
        this.setInputDisabled(3, newValue != 1)
        this.setInputDisabled(4, newValue != 2)
      },
    },
    value: {
      validate: function(newValue) {
        var type = ezP.Do.typeOfString(newValue)
        var variant = this.data.variant.get()
        return type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name || variant === 1 && (type === ezP.T3.Expr.parent_module)?
        {validated: newValue}: null
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText() || '', 2, ezP.Key.FROM)
      },
    },
  },
  tiles: {
    import_module: {
      order: 1,
      label: 'import',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.non_void_module_as_list,
    },
    from: {
      order: 2,
      label: 'from',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.relative_module,
      plugged: ezP.T3.Expr.relative_module,
      hole_value: 'module',
      edit: {
        key:ezP.Key.FROM,
        edit: '',
        placeholder: ezP.Msg.Placeholder.MODULE,
        validator: function(txt) {
          return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue(), ezP.Key.VALUE)
        },
        onEndEditing: function () {
          this.ezp.setData(this.getValue(), ezP.Key.VALUE)
        },
      },
    },
    import: {
      order: 3,
      label: 'import',
      css_class: 'ezp-code-reserved',
      wrap: ezP.T3.Expr.non_void_import_identifier_as_list,
    },
    import_star: {
      order: 4,
      label: 'import *',
      css_class: 'ezp-code-reserved',
    },
  },
})

console.log('When read from dom, if the read data is not valid, what to do?')

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
  var current = block.ezp.data.variant.get()
  var F = function(content, variant) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(variant)
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
ezP.DelegateSvg.Stmt.makeSubclass('future_statement', {
  tiles: {
    list: {
      order: 1,
      label: 'from __future__ import',
      css_class: 'ezp-code-reserved',
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