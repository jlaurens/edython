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

/////////////////     module_named      ///////////////////

/**
 * Class for a DelegateSvg, module_named.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.module_named = function (prototypeName) {
  ezP.DelegateSvg.Expr.module_named.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.module_named
  this.inputData = {
    first: {
      key: ezP.Const.Input.SOURCE,
      check: ezP.T3.Expr.Check.module
    },
    last: {
      label: 'as',
      css_class: 'ezp-code-reserved',
      key: ezP.Const.Input.ALIAS,
      check: ezP.T3.Expr.identifier,
      disabled: true,
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.module_named, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('module_named')

ezP.TOGGLE_MODULE_AS_NAME_ID = 'TOGGLE_MODULE_AS_NAME'
/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.module_named.prototype.populateContextMenuFirst_ = function (block, menu) {
  var renderer = ezP.KeyValueMenuItemRenderer.getInstance()
  var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-placeholder',
      goog.dom.createTextNode('module'),
    ),
    goog.dom.createTextNode(' '),
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-reserved',
      goog.dom.createTextNode('as'),
    ),
    goog.dom.createTextNode(' '),
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code-placeholder',
      goog.dom.createTextNode('name'),
    )
  )
  var menuItem = new goog.ui.MenuItem(content, undefined, undefined, renderer)
  menuItem.setValue([ezP.TOGGLE_MODULE_AS_NAME_ID])
  menuItem.setCheckable(true)
  var ezp = this.inputs.last.input.ezpData
  menuItem.setChecked(!ezp.disabled_)
  menu.addChild(menuItem, true)
  ezP.DelegateSvg.Expr.module_named.superClass_.populateContextMenuFirst_.call(this, block, menu)
  return true
}

/**
 * Handle the selection of an item in the first part of the context dropdown menu.
 * Default implementation returns false.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!Blockly.Block} block The Menu component clicked.
 * @param {!goog....} event The event containing as target
 * the MenuItem selected within menu.
 */
ezP.DelegateSvg.Expr.module_named.prototype.handleActionMenuEventFirst = function (block, menu, event) {
  var model = event.target.getModel()
  var action = model[0]
  if (action == ezP.TOGGLE_MODULE_AS_NAME_ID) {
    this.toggleNamedInputDisabled(block, ezP.Const.Input.AS)
    return true
  }
  return false
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden a dom element.
 */
ezP.DelegateSvg.Expr.module_named.prototype.fromDom = function (block, element) {
  ezP.DelegateSvg.Expr.module_named.superClass_.fromDom.call(this, block, element)
  var input = this.inputs.last.input
  if (input.connection.isConnected()) {
    input.ezpData.disabled_ = false
  }
}


/**
 * Class for a DelegateSvg, non_void_module_named_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_module_named_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_module_named_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.Check.non_void_module_named_list, false, ',')
  this.outputCheck = ezP.T3.Expr.non_void_module_named_list
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_module_named_list, ezP.DelegateSvg.List)
ezP.DelegateSvg.Manager.register('non_void_module_named_list')

/////////////////     import_module      ///////////////////

/**
 * Class for a DelegateSvg, identifier_named.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.import_module = function (prototypeName) {
  ezP.DelegateSvg.Expr.import_module.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.import_module
  this.inputData = {
    last: {
      label: 'import',
      css_class: 'ezp-code-reserved',
      key: ezP.Const.Input.IMPORT,
      wrap: ezP.T3.Expr.non_void_module_named_list,
      check: ezP.T3.Expr.non_void_module_named_list,
    }
  }
}
goog.inherits(ezP.DelegateSvg.Expr.import_module, ezP.DelegateSvg.Expr)
ezP.DelegateSvg.Manager.register('import_module')

/*
<pre>
import_expr ::=  import_module | from_relative_module_import | from_module_import


from_relative_module_import ::= "from" relative_module "import" non_void_import_identifier_named_list
# relative_module ::=  "."* module | "."+
relative_module ::=  module | parent_module
parent_module ::= '.' [relative_module]
non_void_import_identifier_named_list ::= import_identifier_named ( "," import_identifier_named )*
import_identifier_named ::= import_identifier "as" import_name
import_identifier ::= an identifier but not a variable name
import_name ::= the usage name of an imported identifier

from_module_import ::= "from" module "import" "*"

import_part ::= import_expr
*/
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

/////////////////     identifier_named      ///////////////////

/**
 * Class for a DelegateSvg, identifier_named.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.identifier_named = function (prototypeName) {
  ezP.DelegateSvg.Expr.identifier_named.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.identifier_named
}
goog.inherits(ezP.DelegateSvg.Expr.identifier_named, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('identifier_named')

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.identifier_named.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.identifier_named.superClass_.initBlock.call(this, block)
  this.inputIDENTIFIER = block.appendValueInput(ezP.Const.Input.IDENTIFIER)
    .setCheck(ezP.T3.Expr.identifier)
  this.inputNAME = block.appendValueInput(ezP.Const.Input.NAME)
    .setCheck(ezP.T3.Expr.identifier)
    .appendField(new ezP.FieldLabel('as'))
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

/////////////////     non_void_identifier_named_list      ///////////////////

/**
 * Class for a DelegateSvg, non_void_identifier_named_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.non_void_identifier_named_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.non_void_identifier_named_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.Expr.identifier_named, false, ',')
  this.outputCheck = ezP.T3.Expr.non_void_identifier_named_list
}
goog.inherits(ezP.DelegateSvg.Expr.non_void_identifier_named_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register('non_void_identifier_named_list')

/////////////////     from_relative_module_import      ///////////////////

/**
 * Class for a DelegateSvg, from_relative_module_import.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.from_relative_module_import = function (prototypeName) {
  ezP.DelegateSvg.Expr.from_relative_module_import.superClass_.constructor.call(this, prototypeName)
  this.outputCheck = ezP.T3.Expr.from_relative_module_import
}
goog.inherits(ezP.DelegateSvg.Expr.from_relative_module_import, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register('from_relative_module_import')

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.from_relative_module_import.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.from_relative_module_import.superClass_.initBlock.call(this, block)
  // from_relative_module_import ::= "from" relative_module "import" identifier ["as" name] ( "," identifier ["as" name] )*
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.T3.Expr.module)
    .setCheck(ezP.T3.Expr.module)
    .appendField(new ezP.FieldLabel('from'))
    .appendField(new ezP.FieldLabel(' '))
    .appendField(new ezP.FieldTextInput('...'), ezP.Const.Field.DOTS)
  this.inputIMPORT = block.appendWrapValueInput(ezP.Const.Input.IMPORT, ezP.T3.Expr.non_void_identifier_named_list)
    .setCheck(ezP.T3.Expr.non_void_identifier_named_list)
    .appendField(new ezP.FieldLabel('import'))
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
 * @param {!goo.ui.Menu} menu The menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.populateContextMenuMiddle_ = function (block, menu) {
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
ezP.DelegateSvg.Stmt.import_stmt.prototype.handleActionMenuEventMiddle = function (block, menu, event) {
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
  return ezP.DelegateSvg.Stmt.import_stmt.superClass_.handleActionMenuEventMiddle.call(this, block, menu, event)
}
/*
<block xmlns="http://www.w3.org/1999/xhtml" type="ezp_expr_from_relative_module_import" id="1A*RZu{nZ5?RJ.d|Bc_@">
<field name="DOTS" value="...">...</field>
<value name="MODULE">
  <block type="ezp_expr_module" id=")W,+tX/iTf_1~_EJJMp*"></block>
</value>
<value name="MODULE">
  <block type="ezp_expr_non_void_identifier_named_list" id="S5ocR;l$.*stXu8j[n3E"></block>
</value>
</block>
*/