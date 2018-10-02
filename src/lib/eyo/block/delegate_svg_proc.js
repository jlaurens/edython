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

goog.provide('eYo.DelegateSvg.Proc')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.DelegateSvg.Group')
goog.require('eYo.MenuItem')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, decorator.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('decorator', {
  data: {
    builtin: {
      all: [
        eYo.Key.STATICMETHOD,
        eYo.Key.CLASSMETHOD,
        eYo.Key.PROPERTY
      ],
      synchronize: true
    },
    property: {
      all: [
        eYo.Key.SETTER,
        eYo.Key.DELETER
      ],
      synchronize: true
    },
    variant: {
      DOTTED_NAME: eYo.Key.DOTTED_NAME,
      BUILTIN: eYo.Key.BUILTIN,
      PROPERTY: eYo.Key.PROPERTY,
      ARGUMENTS: eYo.Key.ARGUMENTS,
      all: [
        eYo.Key.DOTTED_NAME,
        eYo.Key.BUILTIN,
        eYo.Key.PROPERTY,
        eYo.Key.ARGUMENTS
      ],
      synchronize: /** @suppress {globalThis} */ function (newValue) { // would variants synchronize?
        this.synchronize(newValue)
        this.data.dotted_name.setIncog(newValue === this.BUILTIN) // disable the data not the slot
        this.data.builtin.setIncog(newValue !== this.BUILTIN)
        this.data.property.setIncog(newValue !== this.PROPERTY)
        var slot = this.owner.slots.arguments
        slot.setIncog(newValue !== this.ARGUMENTS)
      }
    },
    dotted_name: {
      all: [eYo.T3.Expr.dotted_name, eYo.T3.Expr.identifier],
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var subtypes = this.getAll()
        var subtype = eYo.Do.typeOfString(newValue).expr
        return ((subtypes.indexOf(subtype) >= 0) && {validated: newValue}) || null
      },
      synchronize: true
    }
  },
  fields: {
    prefix: {
      value: '@',
      css: 'reserved'
    }
  },
  slots: {
    dotted_name: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.DECORATOR,
          variable: true
          // left_space: true,
        }
      }
    },
    builtin: {
      order: 2,
      fields: {
        label: {
          css: 'reserved'
        }
      },
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.BUILTIN)
        }
      }
    },
    property: {
      order: 3,
      fields: {
        prefix: '.',
        label: {
          css: 'reserved'
        }
      },
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.PROPERTY)
        }
      }
    },
    arguments: {
      order: 4,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.ARGUMENTS)
        }
      }
    }
  },
  statement: {
    next: {
      required: true
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
eYo.DelegateSvg.Stmt.decorator.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var dotted_name = this.data.dotted_name.get()
  var builtin = this.data.builtin.get()
  var builtins = this.data.builtin.getAll()
  var i_b = builtins.indexOf(builtin)
  var M = this.data.variant.model
  var current = this.data.variant.get
  var property = this.data.property.get()
  var properties = this.data.property.getAll()
  var j_p = properties.indexOf(property)
  var F = function (content, variant, i, j) {
    if (current !== variant ||
      (goog.isDefAndNotNull(i) && i !== i_b) ||
      (goog.isDefAndNotNull(j) && j !== j_p)) {
      var menuItem = mgr.newMenuItem(content, function () {
        if (goog.isDef(i)) {
          block.eyo.data.builtin.set(i)
        } else if (goog.isDef(j)) {
          block.eyo.data.property.set(j)
        }
        block.eyo.data.variant.set(variant)
      })
      mgr.addChild(menuItem)
    }
  }
  for (var i = 0; i < builtins.length; i++) {
    F(eYo.Do.createSPAN('@' + builtins[i], 'eyo-code-reserved'), M.BUILTIN, i)
  }
  for (var j = 0; j < properties.length; j++) {
    F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN('@', 'eyo-code-reserved'),
      eYo.Do.createSPAN(dotted_name || eYo.Msg.Placeholder.DECORATOR, !dotted_name && 'eyo-code-placeholder'),
      eYo.Do.createSPAN('.' + properties[j], 'eyo-code-reserved')
    ), M.PROPERTY, null, j)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('@', 'eyo-code-reserved'),
    eYo.Do.createSPAN(dotted_name || eYo.Msg.Placeholder.DECORATOR, !dotted_name && 'eyo-code-placeholder')
  ), M.DOTTED_NAME)
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('@', 'eyo-code-reserved'),
    eYo.Do.createSPAN(dotted_name || eYo.Msg.Placeholder.DECORATOR, !dotted_name && 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…)')
  ), M.ARGUMENTS)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.decorator.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, funcdef_part.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('funcdef_part', {
  data: {
    variant: {
      TYPE: eYo.Key.Type,
      all: [null, eYo.Key.TYPE],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.slots.type
        slot.required = newValue === this.TYPE
        slot.setIncog()
      }
    },
    name: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type.expr === eYo.T3.Expr.identifier 
        || type.expr === eYo.T3.Expr.identifier
        ? {validated: newValue}
        : null
      },
      synchronize: true
    }
  },
  fields: {
    prefix: 'def',
    name: {
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER
    }
  },
  slots: {
    parameters: {
      order: 1,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.parameter_list
    },
    type: {
      order: 2,
      fields: {
        label: '->'
      },
      check: eYo.T3.Expr.Check.expression
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var variants = this.data.variant.getAll()
  var variant = block.eyo.data.variant.get()
  var F = function (content, key) {
    var menuItem = mgr.newMenuItem(content, function () {
      block.eyo.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('def', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' f', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…)')
  ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('def', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' f', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…) -> …')
  ), variants[1])
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.funcdef_part.superClass_.populateContextMenuFirst_.call(this, block, mgr)
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
      ARGUMENTS: eYo.Key.ARGUMENTS,
      all: [null, eYo.Key.ARGUMENTS],
      synchronize: /** @suppress {globalThis} */ function (newValue){
        this.synchronize(newValue)
        var slot = this.owner.slots.arguments
        slot.required = newValue === this.ARGUMENTS
        slot.setIncog()
      }
    },
    name: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type.expr === eYo.T3.Expr.identifier
        ? {validated: newValue}
        : null
      },
      synchronize: true
    }
  },
  fields: {
    label: {
      value: 'class'
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER,
          variable: true
        }
      }
    },
    arguments: {
      order: 2,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.data.variant
          variant.set(variant.ARGUMENTS)
        }
      }
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var variants = this.data.variant.getAll()
  var variant = block.eyo.data.variant.get()
  var F = function (content, key) {
    var menuItem = mgr.newMenuItem(content, function () {
      block.eyo.data.variant.set(key)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('class', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' name', 'eyo-code-placeholder')
  ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('class', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' name', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…)')
  ), variants[1])
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

eYo.DelegateSvg.Proc.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Stmt.decorator,
  eYo.T3.Stmt.funcdef_part,
  eYo.T3.Stmt.classdef_part
]
