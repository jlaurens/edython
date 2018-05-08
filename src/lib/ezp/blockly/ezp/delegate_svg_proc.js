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

goog.require('ezP.DelegateSvg.Term')
goog.require('ezP.DelegateSvg.Group')
goog.require('ezP.MenuItem')

/**
 * Class for a DelegateSvg, decorator.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "ezp:decorator",
ezP.DelegateSvg.Stmt.makeSubclass(ezP.T3.Stmt.decorator, {
  data: {
    builtin: {
      all: ['staticmethod', 'classmethod'],
      synchronize: true,
    },
    variant: {
      DOTTED_NAME: 0,
      BUILTIN: 1,
      ARGUMENTS: 2,
      all: [0, 1, 2],
      didChange: function(oldValue, newValue) { // would variants synchronize?
        var M = this.model
        this.data.dotted_name.setDisabled(newValue === M.BUILTIN) // disable the data not the tile
        this.data.builtin.setDisabled(newValue !== M.BUILTIN)
        this.ui.tiles.arguments.setDisabled(newValue !== M.ARGUMENTS)
      },
      consolidate: function() { // run after didChange but before synchronize
        if (this.ui.tiles.arguments.isRequiredFromDom()) {
          this.ui.tiles.arguments.setRequiredFromDom(false)
          this.set(this.model.ARGUMENTS)
        } else if (this.data.builtin.isRequiredFromDom()) {
          this.data.builtin.setRequiredFromDom(false)
          this.set(this.model.BUILTIN)          
        }
      }
    },
    subtype: {
      all: [ezP.T3.Expr.dotted_name, ezP.T3.Expr.identifier],
    },
    dotted_name: {
      default: '',
      validate: function(newValue) {
        var subtypes = this.data.subtype.getAll()
        var subtype = ezP.Do.typeOfString(newValue)
        return (subtypes.indexOf(subtype)>= 0) && {validated: newValue} || null
      },
      synchronize: true,
    },
  },
  fields: {
    prefix: {
      value: '@',
      css: 'reserved',
    },
  },
  tiles: {
    dotted_name: {
      order: 1,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: ezP.Msg.Placeholder.DECORATOR,
          // left_space: true,
        },
      },
    },
    builtin: {
      order: 2,
      fields: {
        label: {
          css: 'reserved',
        },
      },
    },
    arguments: {
      order: 3,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: ezP.T3.Expr.argument_list,
      xml: {
        required: true,
      },
    },
  },
  statement: {
    next: {
      required: true,
    }
  }
})

/**
 * decorator blocks are white when followed by a statement.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.DelegateSvg.Stmt.decorator.prototype.isWhite = function (block) {
  return block.nextConnection.isConnected()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
ezP.DelegateSvg.Stmt.decorator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var dotted_name = this.data.dotted_name.get()
  var builtin = this.data.builtin.get()
  var builtins = this.data.builtin.getAll()
  var i_b = builtins.indexOf(builtin)
  var M = this.data.variant.model
  var variant = this.data.variant.get()
  var menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+builtins[0], 'ezp-code-reserved'),
      function() {
    block.ezp.data.builtin.set(0)
    block.ezp.data.variant.set(M.BUILTIN)
  })
  menuItem.setEnabled(i_b != 0 || variant != M.BUILTIN)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      ezP.Do.createSPAN('@'+builtins[1], 'ezp-code-reserved'),
      function() {
    block.ezp.data.builtin.set(1)
    block.ezp.data.variant.set(M.BUILTIN)
  })
  menuItem.setEnabled(i_b != 1 || variant != M.BUILTIN)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN(dotted_name || ezP.Msg.Placeholder.DECORATOR, !dotted_name && 'ezp-code-placeholder'),
    ),
      function() {
    block.ezp.data.variant.set(M.DOTTED_NAME)
  })
  menuItem.setEnabled(variant !== M.DOTTED_NAME)
  mgr.addChild(menuItem)
  menuItem = new ezP.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('@', 'ezp-code-reserved'),
      ezP.Do.createSPAN(dotted_name || ezP.Msg.Placeholder.DECORATOR, !dotted_name && 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)')
    ),
      function() {
    block.ezp.data.variant.set(M.ARGUMENTS)
  })
  menuItem.setEnabled(variant !== M.ARGUMENTS)
  mgr.addChild(menuItem)
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.decorator.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, funcdef_part.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
 // funcdef_part ::= ["async"] "def" funcname "(" [parameter_list] ")" ["->" expression] ":" SUITE

ezP.DelegateSvg.Group.makeSubclass('funcdef_part', {
  data: {
    variant: {
      all: [null, ezP.Key.TYPE],
      synchronize: function (newValue) {
        this.ui.tiles.type.setDisabled(!newValue)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var type = ezP.Do.typeOfString(newValue)
        return type === ezP.T3.Expr.identifier? {validated: newValue}: null
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText())
      },      
    },
  },
  fields: {
    prefix: 'def',
  },
  tiles: {
    name: {
      order: 1,
      fields: {
        edit: {
          placeholder: ezP.Msg.Placeholder.IDENTIFIER,
          validate: function(txt) {
            return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue())
          },
          endEditing: function () {
            this.ezp.setData(this.getValue())
          },
        },
      },
    },
    parameters: {
      order: 2,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: ezP.T3.Expr.parameter_list,
    },
    type: {
      order: 3,
      fields: {
        label: '->',
      },
      check: ezP.T3.Expr.Check.expression,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.data.variant.getAll()
  var variant = block.ezp.data.variant.get()
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('def', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' f', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…) -> …'),
  ), variants[1])
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
ezP.DelegateSvg.Group.makeSubclass('classdef_part', {
  data: {
    variant: {
      all: [null, ezP.Key.ARGUMENTS],
      synchronize: function(newValue) {
        this.ui.tiles.arguments.setDisabled(!newValue)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var type = ezP.Do.typeOfString(newValue)
        return type === ezP.T3.Expr.identifier? {validated: newValue}: null
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText())
      },
    },
  },
  fields: {
    label: {
      value: 'class',
    },
  },
  tiles: {
    name: {
      order: 1,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        },
      },
    },
    arguments: {
      order: 2,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: ezP.T3.Expr.argument_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.data.variant.getAll()
  var variant = block.ezp.data.variant.get()
  var F = function(content, key) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
      ezP.Do.createSPAN('class', 'ezp-code-reserved'),
      ezP.Do.createSPAN(' name', 'ezp-code-placeholder'),
      goog.dom.createTextNode('(…)'),
  ), variants[1])
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

ezP.DelegateSvg.Proc.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Stmt.decorator,
  ezP.T3.Stmt.funcdef_part,
  ezP.T3.Stmt.classdef_part,
]