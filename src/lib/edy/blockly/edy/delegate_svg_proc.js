/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.DelegateSvg.Proc')

goog.require('edY.DelegateSvg.Term')
goog.require('edY.DelegateSvg.Group')
goog.require('edY.MenuItem')

/**
 * Class for a DelegateSvg, decorator.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "edy:decorator",
edY.DelegateSvg.Stmt.makeSubclass(edY.T3.Stmt.decorator, {
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
      synchronize: function(newValue) { // would variants synchronize?
        var M = this.model
        this.data.dotted_name.setIncog(newValue === M.BUILTIN) // disable the data not the tile
        this.data.builtin.setIncog(newValue !== M.BUILTIN)
        this.ui.tiles.arguments.setIncog(newValue !== M.ARGUMENTS)
      },
    },
    subtype: {
      all: [edY.T3.Expr.dotted_name, edY.T3.Expr.identifier],
    },
    dotted_name: {
      default: '',
      validate: function(newValue) {
        var subtypes = this.data.subtype.getAll()
        var subtype = edY.Do.typeOfString(newValue)
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
          placeholder: edY.Msg.Placeholder.DECORATOR,
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
      xml: {
        didLoad: function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.BUILTIN)
        },
      },
    },
    arguments: {
      order: 3,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: edY.T3.Expr.argument_list,
      xml: {
        didLoad: function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.ARGUMENTS)
        },
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
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
edY.DelegateSvg.Stmt.decorator.prototype.isWhite = function (block) {
  return block.nextConnection.isConnected()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
edY.DelegateSvg.Stmt.decorator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var dotted_name = this.data.dotted_name.get()
  var builtin = this.data.builtin.get()
  var builtins = this.data.builtin.getAll()
  var i_b = builtins.indexOf(builtin)
  var M = this.data.variant.model
  var variant = this.data.variant.get()
  var menuItem = new edY.MenuItem(
      edY.Do.createSPAN('@'+builtins[0], 'edy-code-reserved'),
      function() {
    block.edy.data.builtin.set(0)
    block.edy.data.variant.set(M.BUILTIN)
  })
  menuItem.setEnabled(i_b != 0 || variant != M.BUILTIN)
  mgr.addChild(menuItem)
  menuItem = new edY.MenuItem(
      edY.Do.createSPAN('@'+builtins[1], 'edy-code-reserved'),
      function() {
    block.edy.data.builtin.set(1)
    block.edy.data.variant.set(M.BUILTIN)
  })
  menuItem.setEnabled(i_b != 1 || variant != M.BUILTIN)
  mgr.addChild(menuItem)
  menuItem = new edY.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('@', 'edy-code-reserved'),
      edY.Do.createSPAN(dotted_name || edY.Msg.Placeholder.DECORATOR, !dotted_name && 'edy-code-placeholder'),
    ),
      function() {
    block.edy.data.variant.set(M.DOTTED_NAME)
  })
  menuItem.setEnabled(variant !== M.DOTTED_NAME)
  mgr.addChild(menuItem)
  menuItem = new edY.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('@', 'edy-code-reserved'),
      edY.Do.createSPAN(dotted_name || edY.Msg.Placeholder.DECORATOR, !dotted_name && 'edy-code-placeholder'),
      goog.dom.createTextNode('(…)')
    ),
      function() {
    block.edy.data.variant.set(M.ARGUMENTS)
  })
  menuItem.setEnabled(variant !== M.ARGUMENTS)
  mgr.addChild(menuItem)
  mgr.shouldSeparate()
  return edY.DelegateSvg.Stmt.decorator.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, funcdef_part.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
 // funcdef_part ::= ["async"] "def" funcname "(" [parameter_list] ")" ["->" expression] ":" SUITE

edY.DelegateSvg.Group.makeSubclass('funcdef_part', {
  data: {
    variant: {
      all: [null, edY.Key.TYPE],
      synchronize: function (newValue) {
        this.ui.tiles.type.setIncog(!newValue)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var type = edY.Do.typeOfString(newValue)
        return type === edY.T3.Expr.identifier? {validated: newValue}: null
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
          placeholder: edY.Msg.Placeholder.IDENTIFIER,
          validate: function(txt) {
            return this.edy.validateData(goog.isDef(txt)? txt: this.getValue())
          },
          endEditing: function () {
            this.edy.setData(this.getValue())
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
      wrap: edY.T3.Expr.parameter_list,
    },
    type: {
      order: 3,
      fields: {
        label: '->',
      },
      check: edY.T3.Expr.Check.expression,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.data.variant.getAll()
  var variant = block.edy.data.variant.get()
  var F = function(content, key) {
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('def', 'edy-code-reserved'),
      edY.Do.createSPAN(' f', 'edy-code-placeholder'),
      goog.dom.createTextNode('(…)'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('def', 'edy-code-reserved'),
      edY.Do.createSPAN(' f', 'edy-code-placeholder'),
      goog.dom.createTextNode('(…) -> …'),
  ), variants[1])
  mgr.shouldSeparate()
  return edY.DelegateSvg.Stmt.funcdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/*
classdef_part ::=  "class" classname [parenth_argument_list] ':'
*/

/**
 * Class for a DelegateSvg, classdef_part block.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Group.makeSubclass('classdef_part', {
  data: {
    variant: {
      all: [null, edY.Key.ARGUMENTS],
      synchronize: function(newValue) {
        this.ui.tiles.arguments.setIncog(!newValue)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var type = edY.Do.typeOfString(newValue)
        return type === edY.T3.Expr.identifier? {validated: newValue}: null
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
          placeholder: edY.Msg.Placeholder.IDENTIFIER,
        },
      },
    },
    arguments: {
      order: 2,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: edY.T3.Expr.argument_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.data.variant.getAll()
  var variant = block.edy.data.variant.get()
  var F = function(content, key) {
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('class', 'edy-code-reserved'),
      edY.Do.createSPAN(' name', 'edy-code-placeholder'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
      edY.Do.createSPAN('class', 'edy-code-reserved'),
      edY.Do.createSPAN(' name', 'edy-code-placeholder'),
      goog.dom.createTextNode('(…)'),
  ), variants[1])
  mgr.shouldSeparate()
  return edY.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

edY.DelegateSvg.Proc.T3s = [
  edY.T3.Expr.term,
  edY.T3.Stmt.decorator,
  edY.T3.Stmt.funcdef_part,
  edY.T3.Stmt.classdef_part,
]