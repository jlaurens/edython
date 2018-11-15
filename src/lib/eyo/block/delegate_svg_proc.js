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
    property: {
      all: [
        eYo.Key.NONE,
        eYo.Key.SETTER,
        eYo.Key.DELETER
      ],
      init: eYo.Key.NONE,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var dotted_name = this.owner.dotted_name_p
        if (newValue === eYo.Key.SETTER) {
          if (!dotted_name.endsWith('.setter')) {
            this.owner.dotted_name_p = dotted_name + '.setter'
          }
        } else if (newValue === eYo.Key.DELETER) {
          if (!dotted_name.endsWith('.deleter')) {
            this.owner.dotted_name_p = dotted_name + '.deleter'
          }
        } else {
          if (dotted_name.endsWith('.setter')) {
            this.owner.dotted_name_p = dotted_name.substring(0, dotted_name.length - '.setter'.length)
          } else if (dotted_name.endsWith('.deleter')) {
            this.owner.dotted_name_p = dotted_name.substring(0, dotted_name.length - '.deleter'.length)
          }
        }
        this.setIncog(newValue === eYo.Key.NONE)
        // update the placeholder for the name field.
        this.owner.data.name.field.placeholderText(true)
      },
      xml: false
    },
    variant: {
      all: [
        eYo.Key.NONE,
        eYo.Key.PROPERTY,
        eYo.Key.STATICMETHOD,
        eYo.Key.CLASSMETHOD,
        eYo.Key.N_ARY
      ],
      init: eYo.Key.NONE,
      synchronize: /** @suppress {globalThis} */ function (newValue) { // would variants synchronize?
        this.setIncog(newValue !== eYo.Key.N_ARY)
        this.synchronize(newValue)
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (newValue !== eYo.Key.PROPERTY) {
          this.owner.property_p = eYo.Key.NONE
        }
        this.owner.n_ary_s.setIncog(newValue !== eYo.Key.N_ARY)
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          if (this.get() === eYo.Key.N_ARY) {
            var target = this.owner.n_ary_s.targetBlock()
            if (!target.childBlocks_.length) {
              this.save(element)
            }
          }
        }
      }
    },
    name: {
      all: [ // accepted types
        eYo.T3.Expr.dotted_name,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.unset
      ],
      init: '',
      placeholder: /** @suppress {globalThis} */ function () {
        var O = this.sourceBlock_.eyo    
        return O.variant_p === eYo.Key.PROPERTY && O.property_p !== eYo.Key.NONE
        ? eYo.Msg.Placeholder.IDENTIFIER
        : eYo.Msg.Placeholder.DECORATOR
      },
      validate: /** @suppress {globalThis} */ function (newValue) {        
        var p5e = eYo.T3.Profile.get(newValue, null)
        if (this.getAll().indexOf(p5e.expr) >= 0) {
          return {validated: newValue}
        }
        return null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var O = this.owner
        var p = O.property_p
        if (O.variant_p === eYo.Key.PROPERTY && p !== eYo.Key.NONE) {
          newValue = newValue + '.' + p
        }
        O.dotted_name_p = newValue
      },
      xml: false
    },
    dotted_name: {
      all: [ // accepted types
        eYo.T3.Expr.dotted_name,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.unset
      ],
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {        
        var p5e = eYo.T3.Profile.get(newValue, null)
        if (this.getAll().indexOf(p5e.expr) >= 0) {
          return {validated: newValue}
        }
        return null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (newValue) {
          if (newValue.endsWith('.setter')) {
            this.owner.name_p = newValue.substring(0, newValue.length - '.setter'.length)
            this.owner.variant_p = eYo.Key.PROPERTY
            this.owner.property_p = eYo.Key.SETTER
          } else if(newValue.endsWith('.deleter')) {
            this.owner.name_p = newValue.substring(0, newValue.length - '.deleter'.length)
            this.owner.variant_p = eYo.Key.PROPERTY
            this.owner.property_p === eYo.Key.DELETER
          } else {
            if ([
              eYo.Key.PROPERTY,
              eYo.Key.STATICMETHOD,
              eYo.Key.CLASSMETHOD
            ].indexOf(newValue) >= 0) {
              this.owner.variant_p = newValue
            }
            this.owner.name_p = newValue
            this.owner.property_p = eYo.Key.NONE
          }
        } else {
          this.owner.name_p = newValue
          this.owner.property_p = eYo.Key.NONE
        }
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
    name: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          variable: true
          // left_space: true,
        }
      }
    },
    property: {
      order: 2,
      fields: {
        prefix: '.',
        bind: {
          css: 'reserved'
        }
      }
    },
    n_ary: {
      order: 3,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.targetBlock().childBlocks_.length) {
            this.owner.variant_p = eYo.Key.N_ARY
          }
        }
      }
    }
  },
  statement: {
    next: {
      required: true
    }
  }
}, true)

/**
 * decorator blocks are white when followed by a statement.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.decorator.prototype.isWhite = function () {
  return this.nextConnection.isConnected()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
eYo.DelegateSvg.Stmt.decorator.prototype.populateContextMenuFirst_ = function (mgr) {
  var name_d = this.data.name
  var name_p = name_d.get()
  var variant_d = this.data.variant
  var variant_p = variant_d.get()
  var property_d = this.data.property
  var property_p = property_d.get()
  if (variant_p !== eYo.Key.NONE) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('@', 'eyo-code-reserved'),
      eYo.Do.createSPAN(eYo.Msg.Placeholder.DECORATOR, 'eyo-code-placeholder')
    )
    mgr.addChild(mgr.newMenuItem(content, function () {
      variant_d.set(eYo.Key.NONE)
    }))
  }
  var builtins = [
    eYo.Key.STATICMETHOD,
    eYo.Key.CLASSMETHOD,
    eYo.Key.PROPERTY
  ]
  for (var i = 0; i < builtins.length; i++) {
    var builtin = builtins[i]
    if (builtin !== name_p) {
      var content = eYo.Do.createSPAN('@' + builtin, 'eyo-code-reserved')
      mgr.addChild(mgr.newMenuItem(content, (function() {
        var b = builtin
        return function () {
          variant_d.set(b)
          name_d.set(b)
          property_d.set(eYo.Key.NONE)
        }
      }) ()))
    }
  }
  builtins = [
    eYo.Key.SETTER,
    eYo.Key.DELETER
  ]
  for (var i = 0; i < builtins.length; i++) {
    var builtin = builtins[i]
    if (builtin !== property_p) {
      var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN('@', 'eyo-code-reserved'),
        eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
        eYo.Do.createSPAN('.', 'eyo-code'),
        eYo.Do.createSPAN(builtin, 'eyo-code-reserved')
      )
      mgr.addChild(mgr.newMenuItem(content, (function () {
        var b = builtin
        return function () {
          variant_d.set(eYo.Key.PROPERTY)
          property_d.set(b)
        }
      }) ()
      ))
    }
  }
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.decorator.superClass_.populateContextMenuFirst_.call(this, mgr)
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
        var slot = this.owner.type_s
        slot.required = newValue === this.TYPE
        slot.setIncog()
      }
    },
    name: {
      init: '',
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return p5e.expr === eYo.T3.Expr.identifier 
          || p5e.expr === eYo.T3.Expr.unset
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
      endEditing: true
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
}, true)

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
  return eYo.DelegateSvg.Stmt.funcdef_part.superClass_.populateContextMenuFirst_.call(this, mgr)
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
      all: [eYo.Key.NONE, eYo.Key.N_ARY],
      synchronize: /** @suppress {globalThis} */ function (newValue){
        this.synchronize(newValue)
        var slot = this.owner.n_ary_s
        slot.required = newValue === eYo.Key.N_ARY
        slot.setIncog()
      },
      xml: false
    },
    name: {
      init: '',
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return p5e.expr === eYo.T3.Expr.identifier
          || p5e.expr === eYo.T3.Expr.unset
          ? {validated: newValue}
          : null
      },
      synchronize: true
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        label: 'class',
        bind: {
          validate: true,
          endEditing: true,
          variable: true
        }
      }
    },
    n_ary: {
      order: 2,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromModel()) {
            this.owner.variant_p = eYo.Key.N_ARY
          }
        }
      }
    }
  }
}, true)

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
  return eYo.DelegateSvg.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this, mgr)
}

eYo.DelegateSvg.Proc.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Stmt.decorator,
  eYo.T3.Stmt.funcdef_part,
  eYo.T3.Stmt.classdef_part
]
