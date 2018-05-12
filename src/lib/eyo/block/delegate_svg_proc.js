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

goog.provide('eYo.DelegateSvg.Proc')

goog.require('eYo.DelegateSvg.Term')
goog.require('eYo.DelegateSvg.Group')
goog.require('eYo.MenuItem')

/**
 * Class for a DelegateSvg, decorator.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
//  decorator            /*   ::= "@" dotted_name ["(" [argument_list [","]] ")"]    */ : "eyo:decorator",
eYo.DelegateSvg.Stmt.makeSubclass(eYo.T3.Stmt.decorator, {
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
    dotted_name: {
      all: [eYo.T3.Expr.dotted_name, eYo.T3.Expr.identifier],
      init: '',
      validate: function(newValue) {
        var subtypes = this.getAll()
        var subtype = eYo.Do.typeOfString(newValue)
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
          placeholder: eYo.Msg.Placeholder.DECORATOR,
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
      wrap: eYo.T3.Expr.argument_list,
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
eYo.DelegateSvg.Stmt.decorator.prototype.isWhite = function (block) {
  return block.nextConnection.isConnected()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
eYo.DelegateSvg.Stmt.decorator.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var dotted_name = this.data.dotted_name.get()
  var builtin = this.data.builtin.get()
  var builtins = this.data.builtin.getAll()
  var i_b = builtins.indexOf(builtin)
  var M = this.data.variant.model
  var variant = this.data.variant.get()
  var menuItem = new eYo.MenuItem(
      eYo.Do.createSPAN('@'+builtins[0], 'eyo-code-reserved'),
      function() {
    block.eyo.data.builtin.set(0)
    block.eyo.data.variant.set(M.BUILTIN)
  })
  menuItem.setEnabled(i_b != 0 || variant != M.BUILTIN)
  mgr.addChild(menuItem)
  menuItem = new eYo.MenuItem(
      eYo.Do.createSPAN('@'+builtins[1], 'eyo-code-reserved'),
      function() {
    block.eyo.data.builtin.set(1)
    block.eyo.data.variant.set(M.BUILTIN)
  })
  menuItem.setEnabled(i_b != 1 || variant != M.BUILTIN)
  mgr.addChild(menuItem)
  menuItem = new eYo.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('@', 'eyo-code-reserved'),
      eYo.Do.createSPAN(dotted_name || eYo.Msg.Placeholder.DECORATOR, !dotted_name && 'eyo-code-placeholder'),
    ),
      function() {
    block.eyo.data.variant.set(M.DOTTED_NAME)
  })
  menuItem.setEnabled(variant !== M.DOTTED_NAME)
  mgr.addChild(menuItem)
  menuItem = new eYo.MenuItem(
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('@', 'eyo-code-reserved'),
      eYo.Do.createSPAN(dotted_name || eYo.Msg.Placeholder.DECORATOR, !dotted_name && 'eyo-code-placeholder'),
      goog.dom.createTextNode('(…)')
    ),
      function() {
    block.eyo.data.variant.set(M.ARGUMENTS)
  })
  menuItem.setEnabled(variant !== M.ARGUMENTS)
  mgr.addChild(menuItem)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.decorator.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, funcdef_part.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
 // funcdef_part ::= ["async"] "def" funcname "(" [parameter_list] ")" ["->" expression] ":" SUITE

eYo.DelegateSvg.Group.makeSubclass('funcdef_part', {
  data: {
    variant: {
      all: [null, eYo.Key.TYPE],
      synchronize: function (newValue) {
        this.ui.tiles.type.setIncog(!newValue)
      },
    },
    name: {
      init: '',
      validate: function(newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.identifier? {validated: newValue}: null
      },
      synchronize: true,
    },
  },
  fields: {
    prefix: 'def',
    name: {
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
    },
  },
  tiles: {
    parameters: {
      order: 1,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: eYo.T3.Expr.parameter_list,
    },
    type: {
      order: 2,
      fields: {
        label: '->',
      },
      check: eYo.T3.Expr.Check.expression,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.data.variant.getAll()
  var variant = block.eyo.data.variant.get()
  var F = function(content, key) {
    var menuItem = new eYo.MenuItem(content, function() {
      block.eyo.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('def', 'eyo-code-reserved'),
      eYo.Do.createSPAN(' f', 'eyo-code-placeholder'),
      goog.dom.createTextNode('(…)'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('def', 'eyo-code-reserved'),
      eYo.Do.createSPAN(' f', 'eyo-code-placeholder'),
      goog.dom.createTextNode('(…) -> …'),
  ), variants[1])
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.funcdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

/*
classdef_part ::=  "class" classname [parenth_argument_list] ':'
*/

/**
 * Class for a DelegateSvg, classdef_part block.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('classdef_part', {
  data: {
    variant: {
      all: [null, eYo.Key.ARGUMENTS],
      synchronize: function(newValue) {
        this.ui.tiles.arguments.setIncog(!newValue)
      },
    },
    name: {
      init: '',
      validate: function(newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.identifier? {validated: newValue}: null
      },
      synchronize: true,
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
          placeholder: eYo.Msg.Placeholder.IDENTIFIER,
        },
      },
    },
    arguments: {
      order: 2,
      fields: {
        start: '(',
        end: ')',
      },
      wrap: eYo.T3.Expr.argument_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variants = this.data.variant.getAll()
  var variant = block.eyo.data.variant.get()
  var F = function(content, key) {
    var menuItem = new eYo.MenuItem(content, function() {
      block.eyo.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('class', 'eyo-code-reserved'),
      eYo.Do.createSPAN(' name', 'eyo-code-placeholder'),
    ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('class', 'eyo-code-reserved'),
      eYo.Do.createSPAN(' name', 'eyo-code-placeholder'),
      goog.dom.createTextNode('(…)'),
  ), variants[1])
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this,block, mgr)
}

eYo.DelegateSvg.Proc.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Stmt.decorator,
  eYo.T3.Stmt.funcdef_part,
  eYo.T3.Stmt.classdef_part,
]
