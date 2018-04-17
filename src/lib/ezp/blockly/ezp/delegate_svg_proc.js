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

goog.provide('ezP.DelegateSvg.Proc')

goog.require('ezP.DelegateSvg.Group')
goog.require('ezP.MenuItem')

/**
 * Class for a DelegateSvg, dotted_funcname_concrete block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('dotted_funcname_concrete', {
  inputs: {
    m_1: {
      key: ezP.Key.PARENT,
      check: ezP.T3.Expr.identifier,
      hole_value: 'parent',
    },
    m_3: {
      label: '.',
      key: ezP.Key.NAME,
      check: ezP.T3.Expr.Check.dotted_funcname,
      hole_value: 'name',
    },
  },
})
console.warn('implement the statement')
/**
 * Class for a DelegateSvg, decorator_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator_stmt            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp:decorator_stmt",
ezP.DelegateSvg.Manager.makeSubclass('decorator_stmt', {
  inputs: {
    builtins: [null, 'staticmethod', 'classmethod'],
    subtypes: [null, ezP.Key.ARGUMENTS],
    prefix: {
      label: '@',
      css_class: 'ezp-code-reserved',
    },
    m_1: {
      key: ezP.Key.NAME,
      check: ezP.T3.Expr.Check.dotted_funcname,
      hole_value: 'decorator',
    },
    m_2: {
      key: ezP.Key.BUILTIN,
      start: 'staticmethod',
      css_class: 'ezp-code-reserved',
    },
    m_3: {
      start: '(',
      key: ezP.Key.ARGUMENTS,
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
  statement: {
    next: {
      required: true,
    }
  }
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
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.decorator_stmt.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  block.ezp.setNamedInputDisabled(block, ezP.Key.ARGUMENTS, (ezP.Key.ARGUMENTS != newSubtype))
}

/**
 * decorator blocks are white when followed by a statement.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.isWhite = function (block) {
  return block.nextConnection.isConnected()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Stmt.decorator_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var builtin = block.ezp.getProperty(block, ezP.Key.BUILTIN)
  var subtype = block.ezp.getProperty(block, ezP.Key.SUBTYPE)
  var t, menuItem
  var inputs = block.ezp.getModel().inputs
  menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN('decorator', 'ezp-code-placeholder'),
    ),
      function() {
    block.ezp.setProperty(block, ezP.Key.BUILTIN, inputs.builtins[0])
  })
  menuItem.setEnabled((inputs.builtins[0] != builtin) && !subtype)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+inputs.builtins[1], 'ezp-code-reserved'),
      function() {
    block.ezp.setProperty(block, ezP.Key.BUILTIN, inputs.builtins[1])
  })
  menuItem.setEnabled((inputs.builtins[1] != builtin) && !subtype)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+inputs.builtins[2], 'ezp-code-reserved'),
      function() {
    block.ezp.setProperty(block, ezP.Key.BUILTIN, inputs.builtins[2])
  })
  menuItem.setEnabled((inputs.builtins[2] != builtin) && !subtype)
  mgr.addChild(menuItem)
  mgr.shouldSeparate()
  menuItem = new ezP.MenuItem(
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN('decorator', 'ezp-code-placeholder'),
    ), function() {
    block.ezp.setProperty(block, ezP.Key.SUBTYPE, inputs.subtypes[0])
  })
  menuItem.setEnabled(inputs.subtypes[0] != subtype)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
    goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN('decorator', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
    ), function() {
    block.ezp.setProperty(block, ezP.Key.SUBTYPE, inputs.subtypes[1])
  })
  menuItem.setEnabled(inputs.subtypes[1] != subtype)
  mgr.addChild(menuItem)
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.decorator_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, funcdef_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
 // funcdef_part ::= ["async"] "def" funcname "(" [parameter_list] ")" ["->" expression] ":" SUITE

ezP.DelegateSvg.Manager.makeSubclass('funcdef_part', {
  inputs: {
    subtypes: ['', ezP.Key.TYPE],
    m_1: {
      key: ezP.Key.NAME,
      label: 'def',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
    },
    m_2: {
      key: ezP.Key.PARAMETERS,
      start: '(',
      wrap: ezP.T3.Expr.parameter_list,
      end: ')',
    },
    m_3: {
      label: '->',
      key: ezP.Key.TYPE,
      check: ezP.T3.Expr.Check.expression,
    },
  },
}, ezP.DelegateSvg.Group)

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
ezP.DelegateSvg.Stmt.funcdef_part.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.funcdef_part.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  block.ezp.setNamedInputDisabled(block, ezP.Key.TYPE, (ezP.Key.TYPE !== newSubtype))
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var subtypes = block.ezp.getModel().inputs.subtypes
  var menu = mgr.menu
  var current = block.ezp.getProperty(block, ezP.Key.TYPE)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setProperty(block, ezP.Key.TYPE, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
    ), subtypes[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…) -> …'),
  ), subtypes[1])
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.funcdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/*
classdef_part ::=  "class" classname [parenth_argument_list] ':'
*/

/**
 * Class for a DelegateSvg, classdef_part block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('classdef_part', {
  inputs: {
    subtypes: [null, ezP.Key.ARGUMENTS],
    m_1: {
      key: ezP.Key.NAME,
      label: 'class',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.identifier,
      hole_value: 'name',
    },
    m_2: {
      key: ezP.Key.ARGUMENTS,
      start: '(',
      wrap: ezP.T3.Expr.argument_list,
      end: ')',
    },
  },
}, ezP.DelegateSvg.Group)


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
ezP.DelegateSvg.Stmt.classdef_part.prototype.didChangeSubtype = function (block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Stmt.classdef_part.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  block.ezp.setNamedInputDisabled(block, ezP.Key.ARGUMENTS, (ezP.Key.ARGUMENTS !== newSubtype))
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var subtypes = block.ezp.getModel().inputs.subtypes
  var menu = mgr.menu
  var current = block.ezp.getProperty(block, ezP.Key.SUBTYPE)
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setProperty(block, ezP.Key.SUBTYPE, key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
    ), subtypes[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
  ), subtypes[1])
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

ezP.DelegateSvg.Proc.T3s = [
  ezP.T3.Expr.dotted_funcname_concrete,
  ezP.T3.Stmt.decorator_stmt,
  ezP.T3.Stmt.funcdef_part,
  ezP.T3.Stmt.classdef_part,
]