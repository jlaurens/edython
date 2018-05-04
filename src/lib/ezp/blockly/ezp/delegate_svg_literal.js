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

goog.provide('ezP.DelegateSvg.Literal')

goog.require('ezP.DelegateSvg.Expr')

goog.provide('ezP.DelegateSvg.Expr.numberliteral')

/**
* Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.makeSubclass('Literal', {
  data: {
    content: {
      default: '',
    },
  },
}, ezP.DelegateSvg)

/**
 * The xml type of this block, as it should appear in the saved data.
 * Numbers have no xml type.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Literal.prototype.xmlType = function (block) {
  return null
}

/**
* Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Literal.makeSubclass('numberliteral', {
  data: {
    subtype: {
      all: [ezP.T3.Expr.integer, ezP.T3.Expr.floatnumber, ezP.T3.Expr.imagnumber],
      noUndo: true,
    },
    value: {
      default: '0',
      validate: function(newValue) {
        var subtypes = this.data.subtype.getAll()
        var subtype = ezP.Do.typeOfString(newValue)
        return (subtypes.indexOf(subtype)>= 0) && {validated: newValue} || null
      },
      didChange: function(oldValue, newValue) {
        var type = newValue? ezP.Do.typeOfString(newValue): ezP.T3.Expr.integer
        block.ezp.data.subtype.set(type)
        return
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText() || '0', 1, ezP.Key.VALUE)
      },
    },
  },
  tiles: {
    value: {
      order: 1,
      edit: {
        placeholder: ezP.Msg.Placeholder.NUMBER,
        validate: function(txt) {
          return this.ezp.validateData(txt, ezP.Key.VALUE)
        },
        onEndEditing: function () {
          this.ezp.setData(this.getValue(), ezP.Key.VALUE)
        },
      },
    },
  },
  output: {
    check: ezP.T3.Expr.integer,
  },
})

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.showEditor = function (block) {
  this.ui[1].fields.value.showEditor_()
}

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.consolidateType = function (block) {
  var subtype = this.data.subtype.get()
  block.outputConnection.setCheck(subtype)
  ezP.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
}

goog.provide('ezP.DelegateSvg.Expr.shortliteral')

/**
* Class for a DelegateSvg, string litteral.
* The subtype is the kind of delimiters used.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Literal.makeSubclass('shortliteral', {
  data: {
    subtype: {
      all:[ezP.T3.Expr.shortstringliteral, ezP.T3.Expr.shortbytesliteral],
    },
    delimiter: {
      all: ["'", '"'],
      didChange: function(oldValue, newValue) {
        this.data.value.consolidate()
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText(), 1, 'start')
        this.setFieldValue(this.toText(), 1, 'end')
      },
    },
    modifier: {
      all: ['', 'r', 'u', 'R', 'U', 'f', 'F',
    'fr', 'Fr', 'fR', 'FR', 'rf', 'rF', 'Rf', 'RF',
    'b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'],
      didChange: function(oldValue, newValue) {
        this.data.value.consolidate()
      },
      validate: function(newValue) {
        var content = this.data.content.get()
        return (!goog.isDef(content) || this.owner_.getPossibleSubtype(newValue, content)) && {validated: newValue}
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText(), 0, 'prefix')
        this.setMainFieldVisible(!!newValue && !!newValue.length, 'prefix')
      },
    },
    content: {
      default: '',
      didChange: function(oldValue, newValue) {
        this.data.value.consolidate()
      },
      validate: function(newValue) {
        var modifier = this.data.modifier.get()
        return (!goog.isDef(modifier) || this.owner_.getPossibleSubtype(modifier, newValue)) && {validated: newValue} || null
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText() || '', 1)
      },
    },
    value: {
      default: '',
      didChange: function(oldValue, newValue) {
        var F = function(xre, type) {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            this.data.modifier.set(m.prefix||'')
            this.data.delimiter.set(m.delimiter||"'")
            this.data.content.set(m.content||'')
            this.data.subtype.set(type)
            return true
          }
          return false
        }
        F(ezP.XRE.shortstringliteralSingle, ezP.T3.Expr.shortstringliteral)
        || F(ezP.XRE.shortstringliteralDouble, ezP.T3.Expr.shortstringliteral)
        || F(ezP.XRE.shortbytesliteralSingle, ezP.T3.Expr.shortbytesliteral)
        || F(ezP.XRE.shortbytesliteralDouble, ezP.T3.Expr.shortbytesliteral)
      },
      consolidate: function() {
        var modifier = this.data.modifier.get()
        var delimiter = this.data.delimiter.get()
        var content = this.data.content.get()
        if (goog.isDef(modifier) && goog.isDef(delimiter) && goog.isDef(content)) {
          this.set(''+modifier+delimiter+content+delimiter)
        }
      },
    },
  },
  tiles: {
    content: {
      order: 1,
      start: '',
      edit: {
        placeholder: function() {
          var block = this.sourceBlock_
          var ezp = block.ezp
          if (this.placeholderText_) {
            return this.placeholderText_
          }
          var subtype = ezp.data.subtype.get()
          return subtype === ezP.T3.Expr.shortbytesliteral || subtype === ezP.T3.Expr.shortbytesliteral?
          ezP.Msg.Placeholder.BYTES: ezP.Msg.Placeholder.STRING
        },
        validate: function(txt) {
          return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue(), 'content')
        },
        onStartEditing: function () {
          this.ezp.tile.fields.end.setVisible(false)
        },
        onEndEditing: function () {
          this.ezp.setData(this.getValue(), 'content')
          this.ezp.tile.fields.end.setVisible(true)
        },
      },
      end: '',
      css_class: 'ezp-code-reserved',
    },
  },
  fields: {
    prefix: {
      label: '',
      css_class: 'ezp-code-reserved',
    },
  },
  output: {
    check: ezP.T3.Expr.shortstringliteral,
  }
})

/**
 * Get the possible subtype from both modifier and content.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} modifier
 * @param {string} content
 * @return one of the two possible subtypes or undefined when the input does not fit.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.getPossibleSubtype = function (modifier, content) {
  var delimiter = this.data.delimiter.get()
  var value = ''+modifier+delimiter+content+delimiter
  return !!XRegExp.exec(value, ezP.XRE.shortbytesliteralSingle) && ezP.T3.Expr.shortbytesliteral ||
  !!XRegExp.exec(value, ezP.XRE.shortbytesliteralDouble) && ezP.T3.Expr.shortbytesliteral ||
  !!XRegExp.exec(value, ezP.XRE.shortstringliteralSingle) && ezP.T3.Expr.shortstringliteral ||
  !!XRegExp.exec(value, ezP.XRE.shortstringliteralDouble) && ezP.T3.Expr.shortstringliteral
}

console.warn('Change the initData below')
/**
 * Init all the properties of the block.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.initXData = function(block) {
  // first the delimiters in the variant property
  var field = this.ui[1].fields.start
  var variant = field.getValue() || this.data.delimiter.getAll()[0]
  this.data.delimiter.set(variant)
  // validating the modifier depends on the delimiter,
  // hence the variant, to be initialized
  var field = this.ui.fields.prefix
  var modifier = field.getValue() || this.data.modifier.get()
  var content = this.ui[1].fields.value.getValue() || ''
  if (this.getPossibleSubtype(modifier, content)) {
    this.data.modifier.setTrusted(modifier)
    this.data.content.setTrusted(content)
  } else {
    this.data.content.setTrusted(content)
    var modifiers = this.data.modifier.get()
    for (var i = 0; i < modifiers.length; i++) {
      modifier = modifiers[i]
      if (this.data.modifier.set(modifier)) {
        break
      }
    }
  }
  this.consolidateValue(block)
}

/**
 * Set the type dynamically from the modifier.
 * @param {!Blockly.Block} block the owner of the receiver
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.consolidateType = function(block) {
  var type = this.data.subtype.get()
  block.outputConnection.setCheck([type])
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.makeTitle = function (block, variant) {
  return ezP.Do.createSPAN(variant + '…' + variant, 'ezp-code')
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_ = function (block, mgr) {
  mgr.populateProperties(block, 'delimiter')
  mgr.separate()
  var current = this.data.modifier.get()
  var delimiter = this.data.delimiter.get()
  var content = this.data.content.get()
  var can_b = !!this.getPossibleSubtype('b', content)
  var can_f = !!this.getPossibleSubtype('f', content)
  var item = function(msg, modifier) {
    if (modifier !== current) {
      var title = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN(msg, 'ezp-code'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
      )
      return new ezP.MenuItem(title, function() {
        block.ezp.data.modifier.set(modifier)
      })
    }
  }
  if (!current.length) {
    // mgr.addInsertChild(item('u', insert))
    mgr.addInsertChild(item('r', 'r'))
    can_f && mgr.addInsertChild(item('f', 'f'))
    can_b && mgr.addInsertChild(item('b', 'b'))
  } else if (current === 'u') {
    mgr.addRemoveChild(item('u', ''))
  } else if (current === 'r') {
    mgr.addInsertChild(item('f', 'rf'))
    can_b && mgr.addInsertChild(item('b', 'rb'))
    mgr.addRemoveChild(item('r', ''))
  } else if (current === 'f') {
    mgr.addInsertChild(item('r', 'rf'))
    mgr.addRemoveChild(item('f', ''))
  } else if (current === 'b') {
    mgr.addInsertChild(item('r', 'rb'))
    mgr.addRemoveChild(item('b', ''))
  } else if (['rf', 'fr',].indexOf(current.toLowerCase())<0) {
      mgr.addRemoveChild(item('r', 'b'))
      mgr.addRemoveChild(item('b', 'r'))
  } else {
    mgr.addRemoveChild(item('r', 'f'))
    mgr.addRemoveChild(item('f', 'r'))
  }
  mgr.shouldSeparateInsert()
  return true
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, block, mgr)
  ezP.DelegateSvg.Expr.shortliteral.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

goog.provide('ezP.DelegateSvg.Expr.longliteral')

/**
* Class for a DelegateSvg, docstring (expression).
* The subtype is the kind of delimiters used.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Expr.shortliteral.makeSubclass('longliteral', {
  data: {
    subtype: {
      all: [ezP.T3.Expr.longstringliteral, ezP.T3.Expr.longbytesliteral],
    },
    delimiter: {
      all: ["'''", '"""'],
    },
    value: {
      default: '',
      didChange: function(oldValue, newValue) {
        var F = function(xre, type) {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            this.data.modifier.set(m.prefix||'')
            this.data.delimiter.set(m.delimiter||"'''")
            this.data.content.set(m.content||'')
            this.data.subtype.set(type)
            return true  
          }
          return false
        }
        if (F(ezP.XRE.longstringliteralSingle, ezP.T3.Expr.longstringliteral)
        || F(ezP.XRE.longstringliteralDouble, ezP.T3.Expr.longstringliteral)
        || F(ezP.XRE.longbytesliteralSingle, ezP.T3.Expr.longbytesliteral)
        || F(ezP.XRE.longbytesliteralDouble, ezP.T3.Expr.longbytesliteral)) {
          this.removeError(block, ezP.Key.VALUE)
        } else {
          this.setError(block, ezP.Key.VALUE, 'Bad string|bytes literal: '+
          (newValue.length>11?newValue.substr(0,10)+'…':newValue))
        }
      },
    }
  },
  output: {
    check: ezP.T3.Expr.longstringliteral,
  },
})

/**
 * Get the subtype from both modifier and content.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} modifier
 * @param {string} content
 * @return one of the two possible subtypes or undefined when the input does not fit.
 */
ezP.DelegateSvg.Expr.longliteral.prototype.getPossibleSubtype = function (modifier, content) {
  var delimiter = this.data.delimiter.get()
  var value = ''+modifier+delimiter+content+delimiter
  return !!XRegExp.exec(value, ezP.XRE.longbytesliteralSingle) && ezP.T3.Expr.longbytesliteral ||
  !!XRegExp.exec(value, ezP.XRE.longbytesliteralDouble) && ezP.T3.Expr.longbytesliteral ||
  !!XRegExp.exec(value, ezP.XRE.longstringliteralSingle) && ezP.T3.Expr.longstringliteral ||
  !!XRegExp.exec(value, ezP.XRE.longstringliteralDouble) && ezP.T3.Expr.longstringliteral
}

ezP.DelegateSvg.Literal.T3s = [
  ezP.T3.Expr.shortliteral,
  ezP.T3.Expr.longliteral,
  ezP.T3.Expr.numberliteral,
  ]