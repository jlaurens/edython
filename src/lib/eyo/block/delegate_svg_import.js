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
    mandatory: 1,
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
    mandatory: 1,
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
      all: [
        eYo.Key.IMPORT,
        eYo.Key.FROM_MODULE_IMPORT,
        eYo.Key.FROM_MODULE_IMPORT_STAR
      ],
      init: eYo.Key.IMPORT,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var O = this.owner
        var slot = O.import_module_s
        slot.required = newValue === eYo.Key.IMPORT
        slot.setIncog()
        O.from_d.setIncog(newValue === eYo.Key.IMPORT)
        slot = O.import_s
        slot.required = newValue === eYo.Key.FROM_MODULE_IMPORT
        slot.setIncog()
        slot = O.import_star_s
        slot.required = newValue === eYo.Key.FROM_MODULE_IMPORT_STAR
        slot.setIncog()
      }
    },
    from: {
      init:'',
      placeholder: eYo.Msg.Placeholder.MODULE,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        var variant = this.owner.variant_p
        return p5e.expr === eYo.T3.Expr.identifier
        || p5e.expr === eYo.T3.Expr.dotted_name
        || ((variant === eYo.Key.FROM_MODULE_IMPORT)
          && (p5e.expr === eYo.T3.Expr.parent_module))
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
        bind: {
          endEditing: true,
          variable: true // change this to/with a `module` data
        }
      },
      check: [
        eYo.T3.Expr.unset,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.dotted_name
      ],
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          if (this.owner.variant_p === eYo.Key.IMPORT) {
            this.owner.variant_p = eYo.Key.FROM_MODULE_IMPORT_STAR
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
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          var v = this.owner.variant_p
          if (v !== eYo.Key.FROM_MODULE_IMPORT && v !== eYo.Key.FROM_MODULE_IMPORT_STAR)
          this.owner.variant_p = eYo.Key.FROM_MODULE_IMPORT
        }
      }
    },
    import_star: {
      order: 4,
      fields: {
        label: {
          value: 'import *',
          css: 'reserved'
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (this.owner.variant_p === eYo.Key.FROM_MODULE_IMPORT_STAR) {
            element.setAttribute('star', 'true')
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          if (element.getAttribute('star') === 'true') {
            this.owner.variant_p = eYo.Key.FROM_MODULE_IMPORT_STAR
          }
        }
      }
    }
  },
  init: /** @suppress {globalThis} */ function () {
    eYo.DelegateSvg.Stmt.registerImport(this)
  },
  deinit: /** @suppress {globalThis} */ function () {
    eYo.DelegateSvg.Stmt.unregisterImport(this)
  }
}, true)

eYo.Do.addProtocol(eYo.DelegateSvg.Stmt, 'Register', 'Import', function (delegate) {
  return !delegate.block_.isInFlyout
})

/**
 * Returns a dictionary of modules imported by this block, when not disabled.
 */
eYo.DelegateSvg.Stmt.import_stmt.prototype.importedModules = function () {
  if (this.disabled) {
    return
  }
  var modules = {}
  var v = this.variant_p
  if (v === eYo.Key.IMPORT) {
    var t = this.import_s.target // non_void_import_identifier_as_list
    for (var i = 0 ; i < t.inputList.length ; ++i) {
      var t_eyo = t.inputList[i].eyo.t_eyo
      if (t_eyo.type === eYo.T3.Expr.identifier) {
        modules[t_eyo.name_p] = t_eyo.name_p
      } else if (t_eyo.type === eYo.T3.Expr.identifier_as) {
        modules[t_eyo.name_p] = t_eyo.alias_p
      } else {
        var x = t_eyo.expression
        var components = x.split(/\s*,\s*/)
        for (var j = 0 ; j < components.length ; j++) {
          var ased = components[j].split(/\s*as\s*/)
          var name = ased[0]
          name && (modules[name] = ased[1] || name)
        }
      }
    }
  } else /* if (v === eYo.Key.FROM_MODULE_IMPORT[_STAR]) */ {
    var p = this.from_p
    modules[p] = p
  }
  return modules
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 */
eYo.DelegateSvg.Stmt.import_stmt.prototype.getMenuTarget = function () {
  return this.block_
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.import_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var current = this.variant_p
  var F = (content, variant) => {
    if (variant !== current) {
      var menuItem = mgr.newMenuItem(content, () => {
        this.variant_p = variant
      })
      mgr.addChild(menuItem, true)
      menuItem.setEnabled(variant !== current)  
    }
  }
  var from = this.from_p
  var module = from ? from : 'module'
  var style = from ? 'eyo-code' : 'eyo-code-placeholder'
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('import ', 'eyo-code-reserved'),
    eYo.Do.createSPAN(module, style),
    goog.dom.createTextNode(' ['),
    eYo.Do.createSPAN('as', 'eyo-code-reserved'),
    goog.dom.createTextNode(' ...]')
  ), eYo.Key.IMPORT)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('from ', 'eyo-code-reserved'),
    eYo.Do.createSPAN(module + ' ', style),
    eYo.Do.createSPAN('import ', 'eyo-code-reserved'),
    goog.dom.createTextNode('… ['),
    eYo.Do.createSPAN('as', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …]')
  ), eYo.Key.FROM_MODULE_IMPORT)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('from ', 'eyo-code-reserved'),
    eYo.Do.createSPAN(module + ' ', style),
    eYo.Do.createSPAN('import *', 'eyo-code-reserved')
  ), eYo.Key.FROM_MODULE_IMPORT_STAR)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.import_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
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
}, true)

eYo.DelegateSvg.Import.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.non_void_module_as_list,
  eYo.T3.Expr.non_void_import_identifier_as_list,
  eYo.T3.Stmt.import_stmt,
  eYo.T3.Stmt.future_statement
]
