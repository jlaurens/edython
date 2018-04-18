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
module_as ::= module ["as" module_alias]
module ::= module_name ['.' module]
module_alias ::= identifier
#name  ::=  identifier
name ::= IGNORE
module_name ::= identifier
*/

/**
 * Class for a DelegateSvg, module_as.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr._as_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr._as_concrete.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Expr._as_concrete, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Expr._as_concrete.model__ = {
  inputs: {
    i_1: {
      key: ezP.Key.SOURCE,
    },
    i_3: {
      label: 'as',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.AS,
      check: ezP.T3.Expr.identifier,
      hole_value: 'alias',
    }
  }
}

/**
 * Class for a DelegateSvg, module_as_concrete.
 * module_as ::= module ["as" module_alias]
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('module_as_concrete', {
  inputs: {
    i_1: {
      check: ezP.T3.Expr.Check.module,
      hole_value: 'module',
      plugged: ezP.T3.Expr.module,
    },
    i_3: {
      plugged: ezP.T3.Expr.module_alias,
    },
  },
}, ezP.DelegateSvg.Expr._as_concrete)

/**
 * Class for a DelegateSvg, module block.
 * module ::= module_name ['.' module]
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('module_concrete', {
  inputs: {
    i_1: {
      key: ezP.Key.LHS,
      check: ezP.T3.Expr.module_name,
      plugged: ezP.T3.Expr.module_identifier,
      hole_value: 'module',
    },
    i_3: {
      label: '.',
      key: ezP.Key.RHS,
      check: ezP.T3.Expr.Check.module,
      plugged: ezP.T3.Expr.module,
      hole_value: 'submodule',
    },
  },
})

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

/////////////////     import_module      ///////////////////

/**
 * Class for a DelegateSvg, import module.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('import_module', {
  inputs: {
    i_1: {
      label: 'import',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.IMPORT,
      wrap: ezP.T3.Expr.non_void_module_as_list,
    },
  },
})

/////////////////////  from_relative_module_import  ///////////////////////////
/*
from_relative_module_import ::= "from" relative_module "import" non_void_identifier_as_list
# relative_module ::=  "."* module | "."+
relative_module ::=  module | parent_module
parent_module ::= '.' [relative_module]
non_void_identifier_as_list ::= import_identifier_as ( "," import_identifier_as )*
import_identifier_as ::= identifier "as" import_name
identifier ::= an identifier but not as a variable name here
import_name ::= identifier
*/

/**
 * Class for a DelegateSvg, import_identifier_as_concrete.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('import_identifier_as_concrete', {
  inputs: {
    i_1: {
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
      plugged: ezP.T3.Expr.import_identifier,
    },
    i_3: {
      plugged: ezP.T3.Expr.import_alias,
    },
  },
}, ezP.DelegateSvg.Expr._as_concrete)

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

/**
 * Class for a DelegateSvg, parent_module block.
 * This block may be wrapped.
 * parent_module ::= '.' [relative_module]
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('parent_module', {
  inputs: {
    i_1: {
      label: '.',
      key: ezP.Key.MODULE,
      check: ezP.T3.Expr.Check.relative_module,
      plugged: ezP.T3.Expr.relative_module,
      optional: true,
      hole_value: 'module',
    },
  },
})

/**
 * Class for a DelegateSvg, from_relative_module_import module.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('from_relative_module_import', {
  inputs: {
    i_1: {
      label: 'from',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.FROM,
      check: ezP.T3.Expr.Check.relative_module,
      plugged: ezP.T3.Expr.relative_module,
      hole_value: 'module',
    },
    i_3: {
      label: 'import',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.IMPORT,
      wrap: ezP.T3.Expr.non_void_import_identifier_as_list,
    },
  },
})

/////////////////     from_module_import      ///////////////////

/**
 * Class for a DelegateSvg, from_module_import.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('from_module_import', {
  inputs: {
    i_1: {
      label: 'from',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.MODULE,
      check: ezP.T3.Expr.Check.module,
      hole_value: 'module',
    },
    suffix: {
      label: 'import *',
      css_class: 'ezp-code-reserved',
    },
  },
})

/////////////////     import_stmt      ///////////////////

/**
 * Class for a DelegateSvg, import_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('import_stmt', {
  inputs: {
    subtypes: [ezP.T3.Expr.import_module, ezP.T3.Expr.from_relative_module_import,ezP.T3.Expr.from_module_import],
    i_1: {
      wrap: ezP.T3.Expr.import_module,
    },
    i_2: {
      wrap: ezP.T3.Expr.from_relative_module_import,
    },
    i_3: {
      wrap: ezP.T3.Expr.from_module_import,
    },
  },
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
ezP.DelegateSvg.Stmt.import_stmt.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.import_stmt.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  var subtypes = this.getModel().inputs.subtypes
  for (var i = 0, k; (k = subtypes[i++]);) {
    block.ezp.setNamedInputDisabled(block, k, (k !== newSubtype))
  }
}

ezP.DelegateSvg.Stmt.import_stmt.prototype.willRender_ = function(block) {
  ezP.DelegateSvg.Stmt.import_stmt.superClass_.willRender_.call(block.ezp, block)

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
  var values = block.ezp.getModel().inputs.subtypes
  var menu = mgr.menu
  var current = block.ezp.getSubtype(block)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setSubtype(block, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('import ', 'ezp-code-reserved'),
    ezP.Do.createSPAN('module', 'ezp-code-placeholder'),
    goog.dom.createTextNode(' ['),
    ezP.Do.createSPAN('as', 'ezp-code-reserved'),
    goog.dom.createTextNode(' ...]'),
  ), values[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('from ', 'ezp-code-reserved'),
    ezP.Do.createSPAN('module ', 'ezp-code-placeholder'),
    ezP.Do.createSPAN('import ', 'ezp-code-reserved'),
    goog.dom.createTextNode('… ['),
    ezP.Do.createSPAN('as', 'ezp-code-reserved'),
    goog.dom.createTextNode(' …]'),
  ), values[1])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN('from ', 'ezp-code-reserved'),
    ezP.Do.createSPAN('module ', 'ezp-code-placeholder'),
    ezP.Do.createSPAN('import *', 'ezp-code-reserved'),
  ), values[2])
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
  ezP.T3.Expr.module_concrete,
  ezP.T3.Expr.module_as_concrete,
  ezP.T3.Expr.non_void_module_as_list,
  ezP.T3.Expr.import_module,
  ezP.T3.Expr.import_identifier_as_concrete,
  ezP.T3.Expr.non_void_import_identifier_as_list,
  ezP.T3.Expr.parent_module,
  ezP.T3.Expr.from_relative_module_import,
  ezP.T3.Expr.from_module_import,
  ezP.T3.Stmt.import_stmt,
  ezP.T3.Stmt.future_statement,  
]