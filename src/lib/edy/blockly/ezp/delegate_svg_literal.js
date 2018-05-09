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

goog.provide('edY.DelegateSvg.Literal')

goog.require('edY.DelegateSvg.Expr')

goog.provide('edY.DelegateSvg.Expr.numberliteral')

/**
* Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
edY.DelegateSvg.Expr.makeSubclass('Literal', {
  data: {
    content: {
      default: '',
    },
  },
}, edY.DelegateSvg)

/**
 * The xml type of this block, as it should appear in the saved data.
 * Numbers have no xml type.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
edY.DelegateSvg.Literal.prototype.xmlType = function (block) {
  return null
}

/**
* Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
edY.DelegateSvg.Literal.makeSubclass('numberliteral', {
  data: {
    subtype: {
      all: [edY.T3.Expr.integer, edY.T3.Expr.floatnumber, edY.T3.Expr.imagnumber],
      noUndo: true,
    },
    value: {
      default: '0',
      validate: function(newValue) {
        var subtypes = this.data.subtype.getAll()
        var subtype = edY.Do.typeOfString(newValue)
        return (subtypes.indexOf(subtype)>= 0) && {validated: newValue} || null
      },
      didChange: function(oldValue, newValue) {
        var type = newValue? edY.Do.typeOfString(newValue): edY.T3.Expr.integer
        this.data.subtype.set(type)
      },
      synchronize: true,
    },
  },
  fields: {
    value: {
      validate: true,
      endEditing: true,
      placeholder: edY.Msg.Placeholder.NUMBER,
    },
  },
  output: {
    check: edY.T3.Expr.integer,
  },
})

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
edY.DelegateSvg.Expr.numberliteral.prototype.showEditor = function (block) {
  this.ui[1].fields.value.showEditor_()
}

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.numberliteral.prototype.consolidateType = function (block) {
  var subtype = this.data.subtype.get()
  block.outputConnection.setCheck(subtype)
  edY.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
}

goog.provide('edY.DelegateSvg.Expr.shortliteral')

/**
* Class for a DelegateSvg, string litteral.
* The subtype is the kind of delimiters used.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
edY.DelegateSvg.Literal.makeSubclass('shortliteral', {
  data: {
    subtype: {
      all:[edY.T3.Expr.shortstringliteral, edY.T3.Expr.shortbytesliteral],
    },
    delimiter: {
      all: ["'", '"'],
      didChange: function(oldValue, newValue) {
        this.data.value.consolidate()
      },
      synchronize: function(newValue) {
        this.ui.fields.start.setValue(this.toText())
        this.ui.fields.end.setValue(this.toText())
      },
    },
    prefix: {
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
        this.setFieldValue(this.toText())
        this.ui.fields.prefix.setVisible(!!newValue && !!newValue.length)
      },
    },
    content: {
      default: '',
      didChange: function(oldValue, newValue) {
        this.data.value.consolidate()
      },
      validate: function(newValue) {
        var prefix = this.data.prefix.get()
        return (!goog.isDef(prefix) || this.owner_.getPossibleSubtype(prefix, newValue)) && {validated: newValue} || null
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText() || '', 1)
      },
    },
    value: {
      default: '',
      didChange: function(oldValue, newValue) {
        var data = this.data
        var F = function(xre, type) {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            data.prefix.set(m.prefix||'')
            data.delimiter.set(m.delimiter||"'")
            data.content.set(m.content||'')
            data.subtype.set(type)
            return true
          }
          return false
        }
        F(edY.XRE.shortstringliteralSingle, edY.T3.Expr.shortstringliteral)
        || F(edY.XRE.shortstringliteralDouble, edY.T3.Expr.shortstringliteral)
        || F(edY.XRE.shortbytesliteralSingle, edY.T3.Expr.shortbytesliteral)
        || F(edY.XRE.shortbytesliteralDouble, edY.T3.Expr.shortbytesliteral)
      },
      consolidate: function() {
        var prefix = this.data.prefix.get()
        var delimiter = this.data.delimiter.get()
        var content = this.data.content.get()
        if (goog.isDef(prefix) && goog.isDef(delimiter) && goog.isDef(content)) {
          this.set(''+prefix+delimiter+content+delimiter)
        }
      },
    },
  },
  fields: {
    prefix: {
      css: 'reserved',
    },
    start: {
      css: 'reserved',
    },
    content: { // this is the only really unordered field
      placeholder: function() {
        var block = this.sourceBlock_
        var edy = block.edy
        if (this.placeholderText_) {
          return this.placeholderText_
        }
        var subtype = edy.data.subtype.get()
        return subtype === edY.T3.Expr.shortbytesliteral || subtype === edY.T3.Expr.shortbytesliteral?
        edY.Msg.Placeholder.BYTES: edY.Msg.Placeholder.STRING
      },
      validate: true,
      startEditing: function () {
        this.edy.ui.fields.end.setVisible(false)
      },
      endEditing: function () {
        this.edy.data.set(this.getValue())
        this.edy.ui.fields.end.setVisible(true)
      },
    },
    end: {
      css: 'reserved',
    },
  },
  output: {
    check: edY.T3.Expr.shortstringliteral,
  }
})

/**
 * Get the possible subtype from both prefix and content.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} prefix
 * @param {string} content
 * @return one of the two possible subtypes or undefined when the input does not fit.
 */
edY.DelegateSvg.Expr.shortliteral.prototype.getPossibleSubtype = function (prefix, content) {
  var delimiter = this.data.delimiter.get()
  var value = ''+prefix+delimiter+content+delimiter
  return !!XRegExp.exec(value, edY.XRE.shortbytesliteralSingle) && edY.T3.Expr.shortbytesliteral ||
  !!XRegExp.exec(value, edY.XRE.shortbytesliteralDouble) && edY.T3.Expr.shortbytesliteral ||
  !!XRegExp.exec(value, edY.XRE.shortstringliteralSingle) && edY.T3.Expr.shortstringliteral ||
  !!XRegExp.exec(value, edY.XRE.shortstringliteralDouble) && edY.T3.Expr.shortstringliteral
}

console.warn('Change the initData below')
/**
 * Init all the properties of the block.
 * @param {!Blockly.Block} block to be initialized..
 */
edY.DelegateSvg.Expr.shortliteral.prototype.initXData = function(block) {
  // first the delimiters in the variant property
  var field = this.ui[1].fields.start
  var variant = field.getValue() || this.data.delimiter.getAll()[0]
  this.data.delimiter.set(variant)
  // validating the prefix depends on the delimiter,
  // hence the variant, to be initialized
  var field = this.ui.fields.prefix
  var prefix = field.getValue() || this.data.prefix.get()
  var content = this.ui[1].fields.value.getValue() || ''
  if (this.getPossibleSubtype(prefix, content)) {
    this.data.prefix.setTrusted(prefix)
    this.data.content.setTrusted(content)
  } else {
    this.data.content.setTrusted(content)
    var modifiers = this.data.prefix.get()
    for (var i = 0; i < modifiers.length; i++) {
      prefix = modifiers[i]
      if (this.data.prefix.set(prefix)) {
        break
      }
    }
  }
  this.consolidateValue(block)
}

/**
 * Set the type dynamically from the prefix.
 * @param {!Blockly.Block} block the owner of the receiver
 */
edY.DelegateSvg.Expr.shortliteral.prototype.consolidateType = function(block) {
  var type = this.data.subtype.get()
  block.outputConnection.setCheck([type])
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
edY.DelegateSvg.Expr.shortliteral.prototype.makeTitle = function (block, variant) {
  return edY.Do.createSPAN(variant + '…' + variant, 'edy-code')
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Literal.literalPopulateContextMenuFirst_ = function (block, mgr) {
  mgr.populateProperties(block, 'delimiter')
  mgr.separate()
  var current = this.data.prefix.get()
  var delimiter = this.data.delimiter.get()
  var content = this.data.content.get()
  var can_b = !!this.getPossibleSubtype('b', content)
  var can_f = !!this.getPossibleSubtype('f', content)
  var item = function(msg, prefix) {
    if (prefix !== current) {
      var title = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        edY.Do.createSPAN(msg, 'edy-code'),
        goog.dom.createTextNode(' '+edY.Msg.AT_THE_LEFT),
      )
      return new edY.MenuItem(title, function() {
        block.edy.data.prefix.set(prefix)
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
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Expr.shortliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  edY.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, block, mgr)
  edY.DelegateSvg.Expr.shortliteral.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

goog.provide('edY.DelegateSvg.Expr.longliteral')

/**
* Class for a DelegateSvg, docstring (expression).
* The subtype is the kind of delimiters used.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
edY.DelegateSvg.Expr.shortliteral.makeSubclass('longliteral', {
  data: {
    subtype: {
      all: [edY.T3.Expr.longstringliteral, edY.T3.Expr.longbytesliteral],
    },
    delimiter: {
      all: ["'''", '"""'],
    },
    value: {
      default: '',
      didChange: function(oldValue, newValue) {
        var data = this.data
        var F = function(xre, type) {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            data.prefix.set(m.prefix||'')
            data.delimiter.set(m.delimiter||"'''")
            data.content.set(m.content||'')
            data.subtype.set(type)
            return true  
          }
          return false
        }
        if (F(edY.XRE.longstringliteralSingle, edY.T3.Expr.longstringliteral)
        || F(edY.XRE.longstringliteralDouble, edY.T3.Expr.longstringliteral)
        || F(edY.XRE.longbytesliteralSingle, edY.T3.Expr.longbytesliteral)
        || F(edY.XRE.longbytesliteralDouble, edY.T3.Expr.longbytesliteral)) {
          this.owner_.removeError(this.owner_.block_, edY.Key.VALUE)
        } else {
          this.owner_.setError(this.owner_.block_, edY.Key.VALUE, 'Bad string|bytes literal: '+
          (newValue.length>11?newValue.substr(0,10)+'…':newValue))
        }
      },
    }
  },
  output: {
    check: edY.T3.Expr.longstringliteral,
  },
})

/**
 * Get the subtype from both prefix and content.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} prefix
 * @param {string} content
 * @return one of the two possible subtypes or undefined when the input does not fit.
 */
edY.DelegateSvg.Expr.longliteral.prototype.getPossibleSubtype = function (prefix, content) {
  var delimiter = this.data.delimiter.get()
  var value = ''+prefix+delimiter+content+delimiter
  return !!XRegExp.exec(value, edY.XRE.longbytesliteralSingle) && edY.T3.Expr.longbytesliteral ||
  !!XRegExp.exec(value, edY.XRE.longbytesliteralDouble) && edY.T3.Expr.longbytesliteral ||
  !!XRegExp.exec(value, edY.XRE.longstringliteralSingle) && edY.T3.Expr.longstringliteral ||
  !!XRegExp.exec(value, edY.XRE.longstringliteralDouble) && edY.T3.Expr.longstringliteral
}

edY.DelegateSvg.Literal.T3s = [
  edY.T3.Expr.shortliteral,
  edY.T3.Expr.longliteral,
  edY.T3.Expr.numberliteral,
  ]