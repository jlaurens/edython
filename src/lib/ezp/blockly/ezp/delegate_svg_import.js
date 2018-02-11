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
module_as ::= module ["as" alias_name]
module ::= module_name ['.' module]
alias_name ::= identifier
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
  this.sourceLabel = undefined
  this.inputData = {
    first: {
      key: ezP.Const.Input.SOURCE,
    },
    last: {
      label: 'as',
      css_class: 'ezp-code-reserved',
      key: ezP.Const.Input.AS,
      check: ezP.T3.Expr.identifier,
      disabled: true,
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr._as_concrete, ezP.DelegateSvg.Expr)

ezP.TOGGLE_AS_NAME_ID = 'TOGGLE_AS_NAME'
/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr._as_concrete.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var renderer = ezP.KeyValueMenuItemRenderer.getInstance()
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-placeholder',
      goog.dom.createTextNode(this.sourceLabel),
    ),
    goog.dom.createTextNode(' '),
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('as'),
    ),
    goog.dom.createTextNode(' '),
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-placeholder',
      goog.dom.createTextNode('alias'),
    )
  )
  var menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer)
  menuItem.setValue([ezP.TOGGLE_AS_NAME_ID])
  menuItem.setCheckable(true)
  var ezp = this.inputs.last.input.ezpData
  menuItem.setChecked(!ezp.disabled_)
  menu.addChild(menuItem, true)
  ezP.DelegateSvg.Expr._as_concrete.superClass_.populateContextMenuFirst_.call(this, block, menu)
  return true
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr._as_concrete.prototype.handleMenuItemActionFirst = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  if (action == ezP.TOGGLE_AS_NAME_ID) {
    this.toggleNamedInputDisabled(block, ezP.Const.Input.AS)
    return true
  }
  return ezP.DelegateSvg.Expr._as_concrete.superClass_.handleMenuItemActionFirst.call(this, block, menu, event)
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden a dom element.
 */
ezP.DelegateSvg.Expr._as_concrete.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Expr._as_concrete.superClass_.fromDom.call(this, block, element)
  var input = this.inputs.last.input
  input.ezpData.disabled_ = !input.connection.isConnected()
}

/**
 * Class for a DelegateSvg, module_as_concrete.
 * module_as ::= module ["as" alias_name]
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.module_as_concrete = function (prototypeName) {
  ezP.DelegateSvg.Expr.module_as_concrete.superClass_.constructor.call(this, prototypeName)
  this.sourceLabel = 'module'
  this.outputCheck = ezP.T3.Expr.module_as_concrete
  this.inputData.first.check = ezP.T3.Expr.Check.module
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
  this.outputCheck = ezP.T3.Expr.module_concrete
  this.inputData.first = {
    key: ezP.Const.Input.LHS,
    check: ezP.T3.Expr.module_name
  }
  this.inputData.last = {
    label: '.',
    key: ezP.Const.Input.RHS,
    check: ezP.T3.Expr.Check.module
  }
}
goog.inherits(ezP.DelegateSvg.Expr.module_concrete, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('module_concrete')

ezP.MODULE_PARENT_ADD_ID = 'MODULE_PARENT_ADD'
ezP.MODULE_PARENT_REMOVE_ID = 'MODULE_PARENT_REMOVE'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.module_concrete.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var F = function(msg, action) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      goog.dom.createTextNode(msg+' '),
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-placeholder',
        goog.dom.createTextNode('module'),
      ),
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        goog.dom.createTextNode('.'),
      )
    )
    var menuItem = new ezP.MenuItem(content)
    menuItem.setValue([action])
    menu.addChild(menuItem, true)
    return menuItem
  }
  F(ezP.Msg.ADD, ezP.MODULE_PARENT_ADD_ID)
  var parent = block.getParent()
  if (parent) {
    F(ezP.Msg.REMOVE, ezP.MODULE_PARENT_REMOVE_ID).setEnabled(!parent || block.type === parent.type)
  }
  ezP.DelegateSvg.Expr.module_concrete.superClass_.populateContextMenuFirst_.call(this, block, menu)
  return true
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.module_concrete.prototype.handleMenuItemActionFirst = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  if (action == ezP.MODULE_PARENT_ADD_ID) {
    this.insertParent(block, block.type, ezP.Const.Input.RHS)
    return true
  } else if (action == ezP.MODULE_PARENT_REMOVE_ID) {
    this.bypassAndRemoveParent(block)
    return true
  }
  return false
}

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
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.Check.non_void_module_as_list, false, ',')
  this.outputCheck = ezP.T3.Expr.non_void_module_as_list
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
  this.outputCheck = ezP.T3.Expr.import_module
  this.inputData.last = {
    label: 'import',
    css_class: 'ezp-code-reserved',
    key: ezP.Const.Input.IMPORT,
    wrap: ezP.T3.Expr.non_void_module_as_list,
    check: ezP.T3.Expr.non_void_module_as_list,
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
non_void_identifier_as_list ::= identifier_as ( "," identifier_as )*
identifier_as ::= identifier "as" import_name
identifier ::= an identifier but not as a variable name here
import_name ::= identifier
*/

/**
 * Class for a DelegateSvg, identifier_as.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.identifier_as = function (prototypeName) {
  ezP.DelegateSvg.Expr.identifier_as.superClass_.constructor.call(this, prototypeName)
  this.sourceLabel = 'identifier'
  this.inputData.first.check = ezP.T3.Expr.identifier
}
goog.inherits(ezP.DelegateSvg.Expr.identifier_as, ezP.DelegateSvg.Expr._as_concrete)
ezP.DelegateSvg.Manager.register('identifier_as')

/**
 * Class for a DelegateSvg, non_void_identifier_as_list block.
 * This block may be wrapped.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_identifier_as_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_identifier_as_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.Check.non_void_identifier_as_list, false, ',')
  this.outputCheck = ezP.T3.Expr.non_void_identifier_as_list
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_identifier_as_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('non_void_identifier_as_list')

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
  this.outputCheck = ezP.T3.Expr.parent_module
  this.inputData.first = {
    label: '.',
    key: ezP.Const.Input.MODULE,
    check: ezP.T3.Expr.Check.relative_module,
    optional: true,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.parent_module, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('parent_module')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.parent_module.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var menu = mgr.menu
  var F = function(msg, action) {
    var menuItem = new ezP.MenuItem(msg)
    menuItem.setValue([action])
    menu.addChild(menuItem, true)
    return menuItem
  }
  F(ezP.Msg.MODULE_DOT_PREFIX_ADD, ezP.MODULE_PARENT_ADD_ID)
  var parent = block.getParent()
  if (parent) {
    F(ezP.Msg.MODULE_DOT_PREFIX_REMOVE, ezP.MODULE_PARENT_REMOVE_ID).setEnabled(!parent || block.type === parent.type)
  }
  ezP.DelegateSvg.Expr.parent_module.superClass_.populateContextMenuFirst_.call(this, block, menu)
  return true
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.parent_module.prototype.handleMenuItemActionFirst = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  if (action == ezP.MODULE_PARENT_ADD_ID) {
    this.insertParent(block, block.type, ezP.Const.Input.MODULE)
    return true
  } else if (action == ezP.MODULE_PARENT_REMOVE_ID) {
    this.bypassAndRemoveParent(block)
    return true
  }
  return false
}

/**
 * Class for a DelegateSvg, from_relative_module_import module.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.from_relative_module_import = function (prototypeName) {
  ezP.DelegateSvg.Expr.from_relative_module_import.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.from_relative_module_import
  this.inputData.first = {
    label: 'from',
    css_class: 'ezp-code-reserved',
    key: ezP.Const.Input.FROM,
    check: ezP.T3.Expr.Check.relative_module,
  }
  this.inputData.last = {
    label: 'import',
    css_class: 'ezp-code-reserved',
    key: ezP.Const.Input.IMPORT,
    wrap: ezP.T3.Expr.non_void_identifier_as_list,
    check: ezP.T3.Expr.non_void_identifier_as_list,
  }
}
goog.inherits(ezP.DelegateSvg.Expr.from_relative_module_import, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('from_relative_module_import')

/////////////////     dotted_name, module      ///////////////////

/**
 * Class for a DelegateSvg, dotted_name block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.dotted_name = function (prototypeName) {
  ezP.DelegateSvg.Expr.dotted_name.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.identifier, false, '.')
  this.outputCheck = [ezP.T3.Expr.dotted_name, ezP.T3.Expr.module]
}
goog.inherits(ezP.DelegateSvg.Expr.dotted_name, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('dotted_name')

ezP.DelegateSvg.Expr.module = ezP.DelegateSvg.Expr.dotted_name
ezP.DelegateSvg.Manager.register('module')

/////////////////     module_void      ///////////////////

/**
 * Class for a DelegateSvg, module_void block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.module_void = function (prototypeName) {
  ezP.DelegateSvg.Expr.module_void.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.identifier, true, '.')
  this.outputCheck = ezP.T3.Expr.module_void
}
goog.inherits(ezP.DelegateSvg.Expr.module_void, ezP.DelegateSvg.List)

// ezP.DelegateSvg.Manager.register('module_void')


/////////////////     relative_module      ///////////////////

/**
* Class for a DelegateSvg, relative_module.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.relative_module = function (prototypeName) {
  ezP.DelegateSvg.Expr.relative_module.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.relative_module
}
goog.inherits(ezP.DelegateSvg.Expr.relative_module, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('relative_module')

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.relative_module.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.relative_module.superClass_.initBlock.call(this, block)
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.T3.Expr.module)
    .setCheck(ezP.T3.Expr.module)
    .appendField(new ezP.FieldTextInput('...'), ezP.Const.Field.DOTS)
}

/////////////////     relative_module      ///////////////////

/**
* Class for a DelegateSvg, relative_module.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.relative_module = function (prototypeName) {
  ezP.DelegateSvg.Expr.relative_module.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.relative_module
}
goog.inherits(ezP.DelegateSvg.Expr.relative_module, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('relative_module')

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.relative_module.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.relative_module.superClass_.initBlock.call(this, block)
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.T3.Expr.module)
    .setCheck(ezP.T3.Expr.module)
    .appendField(new ezP.FieldTextInput('...'), ezP.Const.Field.DOTS)
}

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
  this.outputCheck = ezP.T3.Expr.from_module_import
}
goog.inherits(ezP.DelegateSvg.Expr.from_module_import, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('from_module_import')

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.from_module_import.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.from_module_import.superClass_.initBlock.call(this, block)
  // from_module_import ::= "from" module "import *"
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.T3.Expr.module)
    .setCheck(ezP.T3.Expr.module)
    .appendField(new ezP.FieldLabel('from'))
  block.appendDummyInput()
    .appendField(new ezP.FieldLabel('import *'))
}

/////////////////     import_stmt      ///////////////////

/**
 * Class for a DelegateSvg, import_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.import_stmt = function (prototypeName) {
  ezP.DelegateSvg.Stmt.import_stmt.superClass_.constructor.call(this, prototypeName)
  this.inputData = {
    last: {
      check: ezP.T3.Expr.Check.import_expr,
      wrap: ezP.T3.Expr.import_module
    }
  }
  this.contextMenuData = [
    {label: 'import module [as ...]', type: ezP.T3.Expr.import_module},
    {label: 'from module import *', type: ezP.T3.Expr.from_module_import},
    {label: 'from module import ... [as ...]', type: ezP.T3.Expr.from_relative_module_import},
  ]
}
goog.inherits(ezP.DelegateSvg.Stmt.import_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register('import_stmt')

ezP.USE_IMPORT_WRAP_TYPE_ID  = 'USE_IMPORT_WRAP_TYPE'

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.ContextMenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.populateContextMenuMiddle_ = function (block, mgr) {
  var menu = mgr.menu
  var last = this.inputs.last.input
  var target = last.connection.targetBlock()
  var type = target? target.type: undefined
  var ezp = this
  var renderer = ezP.MenuItemCodeRenderer.getInstance()
  var F = function(data) {
    var menuItem = new ezP.MenuItem(
      data.label
      ,[ezP.USE_IMPORT_WRAP_TYPE_ID, data.type],
      null,
      renderer
    )
    menuItem.setEnabled(data.type != type)
    menu.addChild(menuItem, true)
  }
  for (var i = 0; i<this.contextMenuData.length; i++) {
    F(this.contextMenuData[i])
  }
  ezP.DelegateSvg.Stmt.import_stmt.superClass_.populateContextMenuMiddle_.call(this,block, menu)
  return true
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * Undo compliant.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!String} newType
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.changeImportWrapType = function (block, newValue) {
  var last = this.inputs.last.input
  var target = last.connection.targetBlock()
  var oldValue = target? target.type: undefined
  if (newValue != oldValue) {
    Blockly.Events.setGroup(true)
    // if (Blockly.Events.isEnabled()) {
    //   Blockly.Events.fire(new Blockly.Events.BlockChange(
    //     block, ezP.Const.Event.change_import_model, '', oldValue, newValue));
    // }
    if (target) {
//      target.unplug()
      target.dispose()
    }
    this.completeWrappedInput_(block, last, newValue)
    Blockly.Events.setGroup(false)
  }
}

/**
 * Handle the selection of an item in the context dropdown menu.
 * @param {!Blockly.Block} block, owner of the delegate.
 * @param {!goog.ui.Menu} menu The Menu clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.handleMenuItemActionMiddle = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  var new_type = model[1]
  if (action == ezP.USE_IMPORT_WRAP_TYPE_ID) {
    setTimeout(function() {
      block.ezp.changeImportWrapType(block, new_type)
      block.render()
    }, 100)
    return true
  }
  return ezP.DelegateSvg.Stmt.import_stmt.superClass_.handleMenuItemActionMiddle.call(this, block, menu, event)
}
