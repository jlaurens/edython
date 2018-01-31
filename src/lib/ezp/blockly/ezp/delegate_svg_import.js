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

goog.require('ezP.DelegateSvg.Expr')
goog.require('ezP.DelegateSvg.Stmt')

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
  this.consolidator = new ezP.Consolidator.List(ezP.T3.identifier, false, '.')
  this.outputCheck = [ezP.T3.dotted_name, ezP.T3.module]
}
goog.inherits(ezP.DelegateSvg.Expr.dotted_name, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.dotted_name, ezP.DelegateSvg.Expr.dotted_name)

ezP.DelegateSvg.Expr.module = ezP.DelegateSvg.Expr.dotted_name
ezP.DelegateSvg.Manager.register(ezP.Const.Expr.module, ezP.DelegateSvg.Expr.module)

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
  this.consolidator = new ezP.Consolidator.List(ezP.T3.identifier, true, '.')
  this.outputCheck = ezP.T3.module_void
}
goog.inherits(ezP.DelegateSvg.Expr.module_void, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.module_void, ezP.DelegateSvg.Expr.module_void)

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
  this.outputCheck = ezP.T3.module_named
}
goog.inherits(ezP.DelegateSvg.Expr.module_named, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.module_named, ezP.DelegateSvg.Expr.module_named)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.module_named.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.module_named.superClass_.initBlock.call(this, block)
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.Const.Expr.module)
    .setCheck(ezP.T3.module)
  this.inputNAME = block.appendValueInput(ezP.Const.Input.NAME)
    .setCheck(ezP.T3.identifier)
    .appendField(new ezP.FieldLabel('as'))
}

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
  this.outputCheck = ezP.T3.identifier_named
}
goog.inherits(ezP.DelegateSvg.Expr.identifier_named, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.identifier_named, ezP.DelegateSvg.Expr.identifier_named)

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
    .setCheck(ezP.T3.identifier)
  this.inputNAME = block.appendValueInput(ezP.Const.Input.NAME)
    .setCheck(ezP.T3.identifier)
    .appendField(new ezP.FieldLabel('as'))
}

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
  this.outputCheck = ezP.T3.import_module
}
goog.inherits(ezP.DelegateSvg.Expr.import_module, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.import_module, ezP.DelegateSvg.Expr.import_module)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.import_module.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.import_module.superClass_.initBlock.call(this, block)
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.Const.Expr.module)
    .setCheck(ezP.T3.module)
    .appendField(new ezP.FieldLabel('import'))
  this.inputNAME = block.appendValueInput(ezP.Const.Input.NAME)
    .setCheck(ezP.T3.identifier)
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
  this.outputCheck = ezP.T3.relative_module
}
goog.inherits(ezP.DelegateSvg.Expr.relative_module, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.relative_module, ezP.DelegateSvg.Expr.relative_module)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.relative_module.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.relative_module.superClass_.initBlock.call(this, block)
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.Const.Expr.module)
    .setCheck(ezP.T3.module)
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
  this.outputCheck = ezP.T3.relative_module
}
goog.inherits(ezP.DelegateSvg.Expr.relative_module, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.relative_module, ezP.DelegateSvg.Expr.relative_module)

/**
 * Initialize the block.
 * Called by the block's init method.
 * For ezPython.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.relative_module.prototype.initBlock = function(block) {
  ezP.DelegateSvg.Expr.relative_module.superClass_.initBlock.call(this, block)
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.Const.Expr.module)
    .setCheck(ezP.T3.module)
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
  this.outputCheck = ezP.T3.from_module_import
}
goog.inherits(ezP.DelegateSvg.Expr.from_module_import, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.from_module_import, ezP.DelegateSvg.Expr.from_module_import)

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
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.Const.Expr.module)
    .setCheck(ezP.T3.module)
    .appendField(new ezP.FieldLabel('from'))
  block.appendDummyInput()
    .appendField(new ezP.FieldLabel('import *'))
}

/////////////////     identifier_named_list      ///////////////////

/**
 * Class for a DelegateSvg, identifier_named_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.identifier_named_list = function (prototypeName) {
  ezP.DelegateSvg.Expr.identifier_named_list.superClass_.constructor.call(this, prototypeName)
  this.consolidator = new ezP.Consolidator.List(ezP.T3.identifier_named, false, ',')
  this.outputCheck = ezP.T3.identifier_named_list
}
goog.inherits(ezP.DelegateSvg.Expr.identifier_named_list, ezP.DelegateSvg.List)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.identifier_named_list, ezP.DelegateSvg.Expr.identifier_named_list)

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
  this.outputCheck = ezP.T3.from_relative_module_import
}
goog.inherits(ezP.DelegateSvg.Expr.from_relative_module_import, ezP.DelegateSvg.Expr)

ezP.DelegateSvg.Manager.register(ezP.Const.Expr.from_relative_module_import, ezP.DelegateSvg.Expr.from_relative_module_import)

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
  this.inputMODULE = block.appendWrapValueInput(ezP.Const.Input.MODULE, ezP.Const.Expr.module)
    .setCheck(ezP.T3.module)
    .appendField(new ezP.FieldLabel('from'))
    .appendField(new ezP.FieldLabel(' '))
    .appendField(new ezP.FieldTextInput('...'), ezP.Const.Field.DOTS)
  this.inputIMPORT = block.appendWrapValueInput(ezP.Const.Input.IMPORT, ezP.Const.Expr.identifier_named_list)
    .setCheck(ezP.T3.identifier_named_list)
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
      check: ezP.T3.Require.import_expr,
      wrap: ezP.Const.Expr.import_module
    }
  }
  this.contextMenuData = [
    {label: 'import module [as ...]', type: ezP.Const.Expr.import_module},
    {label: 'from module import *', type: ezP.Const.Expr.from_module_import},
    {label: 'from module import ... [as ...]', type: ezP.Const.Expr.from_relative_module_import},
  ]
}
goog.inherits(ezP.DelegateSvg.Stmt.import_stmt, ezP.DelegateSvg.Stmt)

ezP.DelegateSvg.Manager.register(ezP.Const.Stmt.import_stmt, ezP.DelegateSvg.Stmt.import_stmt)

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
  <block type="ezp_expr_identifier_named_list" id="S5ocR;l$.*stXu8j[n3E"></block>
</value>
</block>
*/