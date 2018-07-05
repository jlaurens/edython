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

goog.provide('eYo.DelegateSvg.Import')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/// //////////////     module_as      ///////////////////
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
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('non_void_module_as_list', {
  list: {
    check: eYo.T3.Expr.Check.non_void_module_as_list,
    empty: false,
    presep: ',',
    hole_value: 'module'
  }
})

/**
 * Class for a DelegateSvg, non_void_import_identifier_as_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('non_void_import_identifier_as_list', {
  list: {
    check: eYo.T3.Expr.Check.non_void_import_identifier_as_list,
    empty: false,
    presep: ',',
    hole_value: 'name'
  }
})

/// //////////////     import_stmt      ///////////////////

/**
 * Class for a DelegateSvg, import_stmt.
 * The value property is used to store the module.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('import_stmt', {
  data: {
    variant: {
      IMPORT: eYo.Key.IMPORT,
      FROM_MODULE_IMPORT: eYo.Key.FROM_MODULE_IMPORT,
      FROM_MODULE_IMPORT_STAR: eYo.Key.FROM_MODULE_IMPORT_STAR,
      all: [
        eYo.Key.IMPORT,
        eYo.Key.FROM_MODULE_IMPORT,
        eYo.Key.FROM_MODULE_IMPORT_STAR
      ],
      init: eYo.Key.IMPORT,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var slot = this.owner_.slots.import_module
        slot.required = newValue === this.IMPORT
        slot.setIncog(!slot.required)
        this.data.from.setIncog(newValue === this.IMPORT)
        slot = this.owner_.slots.import
        slot.required = newValue === this.FROM_MODULE_IMPORT
        slot.setIncog(!slot.required)
        slot = this.owner_.slots.import_star
        slot.required = newValue === this.FROM_MODULE_IMPORT_STAR
        slot.setIncog(!slot.required)
      }
    },
    from: {
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        var data = this.data.variant
        var variant = data.get()
        var M = data.model
        return type.expr === eYo.T3.Expr.identifier
        || type.expr === eYo.T3.Expr.dotted_name
        || ((variant === data.FROM_MODULE_IMPORT)
          && (type.expr === eYo.T3.Expr.parent_module))
            ? {validated: newValue} : null
      },
      synchronize: true
    }
  },
  slots: {
    import_module: {
      order: 1,
      fields: {
        label: 'import'
      },
      wrap: eYo.T3.Expr.non_void_module_as_list
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.MODULE,
          variable: true // change this to/with a `module` data
        }
      },
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant = this.owner.data.variant
            if (variant.get() === variant.model.IMPORT) {
              variant.set(variant.model.FROM_MODULE_IMPORT_STAR)
            }
          }
        }
      }
    },
    import: {
      order: 3,
      fields: {
        label: 'import'
      },
      wrap: eYo.T3.Expr.non_void_import_identifier_as_list,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant = this.owner.data.variant
            variant.set(variant.FROM_MODULE_IMPORT)
          }
        }
      }
    },
    import_star: {
      order: 4,
      fields: {
        label: {
          value: 'import *',
          css: 'builtin'
        }
      }
    }
  }
})

console.log('When read from dom, if the read data is not valid, what to do?')

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
eYo.DelegateSvg.Stmt.import_stmt.prototype.getMenuTarget = function (block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.import_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.eyo.data.variant.get()
  var F = function (content, variant) {
    if (variant !== current) {
      var menuItem = new eYo.MenuItem(content, function () {
        block.eyo.data.variant.set(variant)
      })
      mgr.addChild(menuItem, true)
      menuItem.setEnabled(variant !== current)  
    }
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('import ', 'eyo-code-reserved'),
    eYo.Do.createSPAN('module', 'eyo-code-placeholder'),
    goog.dom.createTextNode(' ['),
    eYo.Do.createSPAN('as', 'eyo-code-reserved'),
    goog.dom.createTextNode(' ...]')
  ), eYo.Key.IMPORT)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('from ', 'eyo-code-reserved'),
    eYo.Do.createSPAN('module ', 'eyo-code-placeholder'),
    eYo.Do.createSPAN('import ', 'eyo-code-reserved'),
    goog.dom.createTextNode('… ['),
    eYo.Do.createSPAN('as', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …]')
  ), eYo.Key.FROM_MODULE_IMPORT)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('from ', 'eyo-code-reserved'),
    eYo.Do.createSPAN('module ', 'eyo-code-placeholder'),
    eYo.Do.createSPAN('import *', 'eyo-code-reserved')
  ), eYo.Key.FROM_MODULE_IMPORT_STAR)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.import_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/// //////// future
// This is expected to disappear soon
/**
 * Class for a DelegateSvg, future_statement.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('future_statement', {
  slots: {
    list: {
      order: 1,
      fields: {
        label: {
          value: 'from __future__ import',
          css: 'reserved'
        }
      },
      wrap: eYo.T3.Expr.non_void_import_identifier_as_list
    }
  }
})

eYo.DelegateSvg.Import.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Expr.non_void_module_as_list,
  eYo.T3.Expr.non_void_import_identifier_as_list,
  eYo.T3.Stmt.import_stmt,
  eYo.T3.Stmt.future_statement
]
