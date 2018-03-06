/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
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
  this.inputModel_ = {
    first: {
      key: ezP.Key.SOURCE,
    },
    last: {
      label: 'as',
      css_class: 'ezp-code-reserved',
      key: ezP.Key.AS,
      check: ezP.T3.Expr.identifier,
      hole_value: 'alias',
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr._as_concrete, ezP.DelegateSvg.Expr)

/**
 * Class for a DelegateSvg, module_as_concrete.
 * module_as ::= module ["as" module_alias]
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.module_as_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.module_as_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.module_as_concrete
  goog.mixin(this.inputModel_.first, {
    check: ezP.T3.Expr.Check.module,
    hole_value: 'module',
    plugged: ezP.T3.Expr.module,
  })
  this.inputModel_.last.plugged = ezP.T3.Expr.module_alias
}
goog.inherits(ezP.DelegateSvg.Expr.module_as_concrete, ezP.DelegateSvg.Expr._as_concrete)
ezP.DelegateSvg.Manager.register('module_as_concrete')

/**
 * Class for a DelegateSvg, module block.
 * module ::= module_name ['.' module]
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.module_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.module_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.module_concrete
  this.inputModel_.first = {
    key: ezP.Key.LHS,
    check: ezP.T3.Expr.module_name,
    plugged: ezP.T3.Expr.module_identifier,
    hole_value: 'module',
  }
  this.inputModel_.last = {
    label: '.',
    key: ezP.Key.RHS,
    check: ezP.T3.Expr.Check.module,
    plugged: ezP.T3.Expr.module,
    hole_value: 'submodule',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.module_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('module_concrete')

/**
 * Class for a DelegateSvg, non_void_module_as_list block.
 * This block may be wrapped.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_module_as_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_module_as_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    check: ezP.T3.Expr.Check.non_void_module_as_list,
    empty: false,
    sep: ',',
  }
  this.outputModel_.check = ezP.T3.Expr.non_void_module_as_list
  this.hole_value = 'module'
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_module_as_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('non_void_module_as_list')

/////////////////     import_module      ///////////////////

/**
 * Class for a DelegateSvg, import module.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.import_module = function (prototypeName) {
  ezP.DelegateSvg.Expr.import_module.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.import_module
  this.inputModel_.first = {
    label: 'import',
    css_class: 'ezp-code-reserved',
    key: ezP.Key.IMPORT,
    wrap: ezP.T3.Expr.non_void_module_as_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.import_module, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('import_module')

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
ezP.DelegateSvg.Expr.import_identifier_as_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.import_identifier_as_concrete.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.import_identifier_as_concrete
  goog.mixin(this.inputModel_.first, {
    check: ezP.T3.Expr.identifier,
    hole_value: 'name',
    plugged: ezP.T3.Expr.import_identifier,
  })
  this.inputModel_.last.plugged = ezP.T3.Expr.import_alias
}
goog.inherits(ezP.DelegateSvg.Expr.import_identifier_as_concrete, ezP.DelegateSvg.Expr._as_concrete)
ezP.DelegateSvg.Manager.register('import_identifier_as_concrete')

/**
 * Class for a DelegateSvg, non_void_import_identifier_as_list block.
 * This block may be wrapped.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_import_identifier_as_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_import_identifier_as_list.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.list = {
    check: ezP.T3.Expr.Check.non_void_import_identifier_as_list,
    empty: false,
    sep: ',',
    hole_value: 'name',
  }
  this.outputModel_.check = ezP.T3.Expr.non_void_import_identifier_as_list
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_import_identifier_as_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('non_void_import_identifier_as_list')

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
ezP.DelegateSvg.Expr.parent_module = function (prototypeName) {
  ezP.DelegateSvg.Expr.parent_module.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.parent_module
  this.inputModel_.first = {
    label: '.',
    key: ezP.Key.MODULE,
    check: ezP.T3.Expr.Check.relative_module,
    plugged: ezP.T3.Expr.relative_module,
    optional: true,
    hole_value: 'module',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.parent_module, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('parent_module')

/**
 * Class for a DelegateSvg, from_relative_module_import module.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.from_relative_module_import = function (prototypeName) {
  ezP.DelegateSvg.Expr.from_relative_module_import.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.from_relative_module_import
  this.inputModel_.first = {
    label: 'from',
    css_class: 'ezp-code-reserved',
    key: ezP.Key.FROM,
    check: ezP.T3.Expr.Check.relative_module,
    plugged: ezP.T3.Expr.relative_module,
    hole_value: 'module',
  }
  this.inputModel_.last = {
    label: 'import',
    css_class: 'ezp-code-reserved',
    key: ezP.Key.IMPORT,
    wrap: ezP.T3.Expr.non_void_import_identifier_as_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.from_relative_module_import, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('from_relative_module_import')

/////////////////     from_module_import      ///////////////////

/**
 * Class for a DelegateSvg, from_module_import.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.from_module_import = function (prototypeName) {
  ezP.DelegateSvg.Expr.from_module_import.superClass_.constructor.call(this, prototypeName)
  this.outputModel_.check = ezP.T3.Expr.from_module_import
  this.inputModel_.first = {
    key: ezP.Key.MODULE,
    label: 'from',
    css_class: 'ezp-code-reserved',
    check: ezP.T3.Expr.Check.module,
    hole_value: 'module',
  }
  this.inputModel_.last = {
    label: 'import *',
    css_class: 'ezp-code-reserved',
  }
}
goog.inherits(ezP.DelegateSvg.Expr.from_module_import, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('from_module_import')

/////////////////     import_part      ///////////////////

/**
 * Class for a DelegateSvg, import_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.import_part = function (prototypeName) {
  ezP.DelegateSvg.Stmt.import_part.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.last = {
    key: ezP.Key.MODULE,
    check: ezP.T3.Expr.Check.import_expr,
    wrap: ezP.T3.Expr.import_module,
  }
  this.menuData = [
    {
      content: goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        ezP.Do.createSPAN('import ', 'ezp-code-reserved'),
        ezP.Do.createSPAN('module', 'ezp-code-placeholder'),
        goog.dom.createTextNode(' ['),
        ezP.Do.createSPAN('as', 'ezp-code-reserved'),
        goog.dom.createTextNode(' ...]'),
      ),
      type: ezP.T3.Expr.import_module
    },
    {
      content:   goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        ezP.Do.createSPAN('from ', 'ezp-code-reserved'),
        ezP.Do.createSPAN('module ', 'ezp-code-placeholder'),
        ezP.Do.createSPAN('import ', 'ezp-code-reserved'),
        goog.dom.createTextNode('… ['),
        ezP.Do.createSPAN('as', 'ezp-code-reserved'),
        goog.dom.createTextNode(' …]'),
      ),
      type: ezP.T3.Expr.from_relative_module_import
    },
    {
      content:   goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        ezP.Do.createSPAN('from ', 'ezp-code-reserved'),
        ezP.Do.createSPAN('module ', 'ezp-code-placeholder'),
        ezP.Do.createSPAN('import *', 'ezp-code-reserved'),
      ),
      type: ezP.T3.Expr.from_module_import
    },
  ]
}
goog.inherits(ezP.DelegateSvg.Stmt.import_part, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('import_part')

/**
 * When the block is just a wrapper, returns the wrapped target.
 * @param {!Blockly.Block} block owning the delegate.
 */
ezP.DelegateSvg.Stmt.import_part.prototype.getMenuTarget = function(block) {
  return block
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.import_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var yorn
  var D = ezP.DelegateSvg.Manager.getInputModel(block.type)
  if (yorn = mgr.populate_wrap_alternate(block, D.last.key)) {
    mgr.shouldSeparate()
  }
  return ezP.DelegateSvg.Stmt.import_part.superClass_.populateContextMenuFirst_.call(this,block, mgr) || yorn
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Stmt.import_part.prototype.handleMenuItemActionFirst = function (block, mgr, event) {
  return mgr.handleAction_wrap_alternate(block, event) || ezP.DelegateSvg.Stmt.import_part.superClass_.handleMenuItemActionMiddle.call(this, block, mgr, event)
}

/////////// future

/**
 * Class for a DelegateSvg, future_statement.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.future_statement = function (prototypeName) {
  ezP.DelegateSvg.Stmt.future_statement.superClass_.constructor.call(this, prototypeName)
  this.inputModel_.first = {
    label: 'from __future__ import',
    css_class: 'ezp-code-reserved',
    key: ezP.Key.LIST,
    wrap: ezP.T3.Expr.non_void_import_identifier_as_list,
  }
  this.statementModel_.previous.check = ezP.T3.Stmt.Previous.future_statement
  this.statementModel_.next.check = ezP.T3.Stmt.Next.future_statement
}
goog.inherits(ezP.DelegateSvg.Stmt.future_statement, ezP.DelegateSvg.Stmt)
ezP.DelegateSvg.Manager.register('future_statement')
