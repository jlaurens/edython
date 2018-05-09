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

goog.provide('edY.DelegateSvg.Import')

goog.require('edY.DelegateSvg.List')
goog.require('edY.DelegateSvg.Stmt')

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
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.List.makeSubclass('non_void_module_as_list', {
  list: {
    check: edY.T3.Expr.Check.non_void_module_as_list,
    empty: false,
    presep: ',',
    hole_value: 'module',
  },
})

/**
 * Class for a DelegateSvg, non_void_import_identifier_as_list block.
 * This block may be wrapped.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.List.makeSubclass('non_void_import_identifier_as_list', {
  list: {
    check: edY.T3.Expr.Check.non_void_import_identifier_as_list,
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
edY.DelegateSvg.Stmt.makeSubclass('import_stmt', {
  data: {
    variant: {
      IMPORT: 0,
      FROM_MODULE_IMPORT: 1,
      FROM_MODULE_IMPORT_STAR: 2,
      all: [0, 1, 2],
      default: 0,
      synchronize: function(newValue) {
        // var disabled_1 = true, disabled_2 = true, disabled_3 = true, disabled_4 = true
        // switch(newValue) {
        //   case 0: disabled_1 = false; break
        //   case 1: disabled_2 = disabled_3 = false; break
        //   case 2: disabled_2 = disabled_4 = false; break
        // }
        var model = this.model
        this.ui.tiles.import_module.setIncog(newValue != model.IMPORT)
        this.data.from.setIncog(newValue == model.IMPORT)
        this.ui.tiles.import.setIncog(newValue != model.FROM_MODULE_IMPORT)
        this.ui.tiles.import_star.setIncog(newValue != model.FROM_MODULE_IMPORT_STAR)
      },
    },
    from: {
      validate: function(newValue) {
        var type = edY.Do.typeOfString(newValue)
        var variant = this.data.variant.get()
        var model = this.data.variant.model
        return type === edY.T3.Expr.identifier || type === edY.T3.Expr.dotted_name || variant === model.FROM_MODULE_IMPORT && (type === edY.T3.Expr.parent_module)?
        {validated: newValue}: null
      },
      synchronize: true,
    },
  },
  tiles: {
    import_module: {
      order: 1,
      fields: {
        label: 'import',
      },
      wrap: edY.T3.Expr.non_void_module_as_list,
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        edit: {
          validate: true,
          endEditing: true,
          placeholder: edY.Msg.Placeholder.MODULE,
        },
      },
    },
    import: {
      order: 3,
      fields: {
        label: 'import',
      },
      wrap: edY.T3.Expr.non_void_import_identifier_as_list,
    },
    import_star: {
      order: 4,
      fields: {
        label: 'import *',
      },
    },
  },
})

console.log('When read from dom, if the read data is not valid, what to do?')

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
edY.DelegateSvg.Stmt.import_stmt.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.import_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.edy.data.variant.get()
  var F = function(content, variant) {
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.variant.set(variant)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(variant !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
    edY.Do.createSPAN('import ', 'edy-code-reserved'),
    edY.Do.createSPAN('module', 'edy-code-placeholder'),
    goog.dom.createTextNode(' ['),
    edY.Do.createSPAN('as', 'edy-code-reserved'),
    goog.dom.createTextNode(' ...]'),
  ), 0)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
    edY.Do.createSPAN('from ', 'edy-code-reserved'),
    edY.Do.createSPAN('module ', 'edy-code-placeholder'),
    edY.Do.createSPAN('import ', 'edy-code-reserved'),
    goog.dom.createTextNode('… ['),
    edY.Do.createSPAN('as', 'edy-code-reserved'),
    goog.dom.createTextNode(' …]'),
  ), 1)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
    edY.Do.createSPAN('from ', 'edy-code-reserved'),
    edY.Do.createSPAN('module ', 'edy-code-placeholder'),
    edY.Do.createSPAN('import *', 'edy-code-reserved'),
  ), 2)
  mgr.shouldSeparate()
  return edY.DelegateSvg.Stmt.import_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
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
edY.DelegateSvg.Stmt.makeSubclass('future_statement', {
  tiles: {
    list: {
      order: 1,
      fields: {
        label: {
          value: 'from __future__ import',
          css: 'reserved',
        }
      },
      wrap: edY.T3.Expr.non_void_import_identifier_as_list,
    },
  },
})

edY.DelegateSvg.Import.T3s = [
  edY.T3.Expr.term,
  edY.T3.Expr.non_void_module_as_list,
  edY.T3.Expr.non_void_import_identifier_as_list,
  edY.T3.Stmt.import_stmt,
  edY.T3.Stmt.future_statement,  
]