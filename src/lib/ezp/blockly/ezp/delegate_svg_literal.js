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
ezP.DelegateSvg.Literal = function (prototypeName) {
  ezP.DelegateSvg.Literal.superClass_.constructor.call(this, prototypeName)
}
goog.inherits(ezP.DelegateSvg.Literal, ezP.DelegateSvg.Expr)

ezP.Delegate.addInstanceProperty(ezP.DelegateSvg.Literal, ezP.Key.CONTENT)

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
ezP.DelegateSvg.Manager.makeSubclass('numberliteral', {
  inputs: {
    subtypes: [ezP.T3.Expr.integer, ezP.T3.Expr.floatnumber, ezP.T3.Expr.imagnumber],
    i_1: {
      number: {
        key:ezP.Key.VALUE,
        value: 0,
        placeholder: ezP.Msg.Placeholder.NUMBER,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          var value = this.getValue()
          if (value.length) {
            ezp.setValue(block, this.getValue())
          }
        },
      },
    },
  },
  output: {
    check: ezP.T3.Expr.integer,
  },
}, ezP.DelegateSvg.Literal)

/**
 * Initialize the value.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.initValue = function (block) {
  this.setValue(block, this.ui.i_1.fields.value.getValue() || '0')
}

/**
 * When the value did change, sets the subtype accordingly.
 * @param {!Blockly.Block} block to be synchronized.
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.synchronizeValue = function (block, newValue) {
  this.ui.i_1.fields.value.setValue(newValue || '0')
}

/**
 * When the value did change, sets the subtype accordingly.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.didChangeValue = function (block, oldValue, newValue) {
  ezP.DelegateSvg.Expr.numberliteral.superClass_.didChangeValue.call(this, block, oldValue, newValue)
  var type = newValue? ezP.Do.typeOfString(newValue): ezP.T3.Expr.integer
  block.ezp.setSubtype(block, type)
  return
}

/**
 * Validates the new value.
 * The type must be one of `dotted_name` or `identifier`.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.validateValue = function (block, newValue) {
  var subtypes = this.getSubtypes(block)
  var subtype = ezP.Do.typeOfString(newValue)
  return (subtypes.indexOf(subtype)>= 0) && {validated: newValue} || null
}

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.showEditor = function (block) {
  this.ui.i_1.fields.value.showEditor_()
}

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.consolidateType = function (block) {
  var subtype = this.getSubtype(block)
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
ezP.DelegateSvg.Manager.makeSubclass('shortliteral', {
  inputs: {
    subtypes: [ezP.T3.Expr.shortstringliteral, ezP.T3.Expr.shortbytesliteral],
    variants: ["'", '"'],
    modifiers: ['', 'r', 'u', 'R', 'U', 'f', 'F',
    'fr', 'Fr', 'fR', 'FR', 'rf', 'rF', 'Rf', 'RF',
    'b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'],
    prefix: {
      label: '',
      css_class: 'ezp-code-reserved',
    },
    i_1: {
      start: '',
      string: {
        key:ezP.Key.VALUE,
        value: '',
        placeholder: function() {
          var block = this.sourceBlock_
          var ezp = block.ezp
          if (this.placeholderText_) {
            return this.placeholderText_
          }
          var subtype = ezp.getSubtype(block)
          return subtype === ezP.T3.Expr.shortbytesliteral || subtype === ezP.T3.Expr.shortbytesliteral?
          ezP.Msg.Placeholder.BYTES: ezP.Msg.Placeholder.STRING
        },
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateContent(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onStartEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.ui.i_1.fields.end.setVisible(false)
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          var value = this.getValue()
          ezp.setContent(block, this.getValue())
          ezp.ui.i_1.fields.end.setVisible(true)
        },
      },
      end: '',
      css_class: 'ezp-code-reserved',
    },
  },
  output: {
    check: ezP.T3.Expr.shortstringliteral,
  }
}, ezP.DelegateSvg.Literal)

/**
 * Get the possible subtype from both modifier and content.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} modifier
 * @param {string} content
 * @return one of the two possible subtypes or undefined when the input does not fit.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.getPossibleSubtype = function (block, modifier, content) {
  var delimiter = this.getVariant(block)
  var value = ''+modifier+delimiter+content+delimiter
  return !!XRegExp.exec(value, ezP.XRE.shortbytesliteralSingle) && ezP.T3.Expr.shortbytesliteral ||
  !!XRegExp.exec(value, ezP.XRE.shortbytesliteralDouble) && ezP.T3.Expr.shortbytesliteral ||
  !!XRegExp.exec(value, ezP.XRE.shortstringliteralSingle) && ezP.T3.Expr.shortstringliteral ||
  !!XRegExp.exec(value, ezP.XRE.shortstringliteralDouble) && ezP.T3.Expr.shortstringliteral
}

/**
 * Set the value from the other properties.
 * @param {!Blockly.Block} block the owner of the receiver
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.consolidateValue = function(block) {
  var modifier = this.getModifier(block)
  var delimiter = this.getVariant(block)
  var content = this.getContent(block)
  if (goog.isDef(modifier) && goog.isDef(delimiter) && goog.isDef(content)) {
    this.setValue(block, ''+modifier+delimiter+content+delimiter)
  }
}

/**
 * Init all the properties of the block.
 * @param {!Blockly.Block} block to be initialized..
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.initProperties = function(block) {
  // first the delimiters in the variant property
  var field = this.ui.i_1.fields.start
  var variant = field.getValue() || this.getVariants(block)[0]
  this.setVariant(block, variant)
  // validating the modifier depends on the delimiter,
  // hence the variant, to be initialized
  var field = this.ui.fields.prefix
  var modifier = field.getValue() || this.getModifiers(block)[0]
  var content = this.ui.i_1.fields.value.getValue() || ''
  if (this.getPossibleSubtype(block, modifier, content)) {
    this.setValidatedModifier(block, modifier)
    this.setValidatedContent(block, content)
  } else {
    this.setValidatedContent(block, content)
    var modifiers = this.getModifiers(block)
    for (var i = 0; i < modifiers.length;) {
      modifier = modifiers[i]
      if (this.setModifier(block, modifier)) {
        break
      }
    }
  }
  this.consolidateValue(block)
}

/**
 * When the value did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.didChangeValue = function (block, oldValue, newValue) {
  var F = function(xre, type) {
    var m = XRegExp.exec(newValue, xre)
    if (m) {
      block.ezp.setModifier(block, m.prefix||'')
      block.ezp.setVariant(block, m.delimiter||"'")
      block.ezp.setContent(block, m.content||'')
      block.ezp.setSubtype(block, type)
      return true  
    }
    return false
  }
  F(ezP.XRE.shortstringliteralSingle, ezP.T3.Expr.shortstringliteral)
  || F(ezP.XRE.shortstringliteralDouble, ezP.T3.Expr.shortstringliteral)
  || F(ezP.XRE.shortbytesliteralSingle, ezP.T3.Expr.shortbytesliteral)
  || F(ezP.XRE.shortbytesliteralDouble, ezP.T3.Expr.shortbytesliteral)
}

/**
 * When the content did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldContent
 * @param {string} newContent
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.didChangeVariant = 
ezP.DelegateSvg.Expr.shortliteral.prototype.didChangeModifier = 
ezP.DelegateSvg.Expr.shortliteral.prototype.didChangeContent = function (block, oldContent, newContent) {
  this.consolidateValue(block)
}

/**
 * Change the UI.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.synchronizeContent = function (block, newContent) {
  this.ui.i_1.fields.value.setValue(newContent || '')
}

/**
 * When the content did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldContent
 * @param {string} newContent
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.validateContent = function (block, newContent) {
  var modifier = this.getModifier(block)
  return (!goog.isDef(modifier) || this.getPossibleSubtype(block, modifier, newContent)) && {validated: newContent} || null
}

/**
 * Synchronize the UI with the property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.validateModifier = function (block, newModifier) {
  var content = this.getContent(block)
  return (!goog.isDef(content) || this.getPossibleSubtype(block, newModifier, content)) && {validated: newModifier}
}

/**
 * Synchronize the UI with the property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.synchronizeModifier = function (block) {
  var field = this.ui.fields.prefix
  var modifier = this.getModifier(block)
  field.setValue(modifier)
  field.setVisible(!!modifier && !!modifier.length)
}

/**
 * Synchronize the UI with the property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.synchronizeVariant = function (block) {
  var start = this.ui.i_1.fields.start
  var end = this.ui.i_1.fields.end
  var variant = this.getVariant(block)
  start.setValue(variant)
  end.setValue(variant)
}

/**
 * Set the type dynamically from the modifier.
 * @param {!Blockly.Block} block the owner of the receiver
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.consolidateType = function(block) {
  var type = this.getSubtype(block)
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
  mgr.populateProperties(block, 'variant')
  mgr.separate()
  var current = this.getModifier(block).toLowerCase()
  var delimiter = this.getVariant(block)
  var content = this.getContent(block)
  var can_b = !!this.getPossibleSubtype(block, 'b', content)
  var can_f = !!this.getPossibleSubtype(block, 'f', content)
  var item = function(msg, modifier) {
    if (modifier !== current) {
      var title = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        ezP.Do.createSPAN(msg, 'ezp-code'),
        goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
      )
      return new ezP.MenuItem(title, function() {
        block.ezp.setModifier(block, modifier)
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
ezP.DelegateSvg.Manager.makeSubclass('longliteral', {
  inputs: {
    subtypes: [ezP.T3.Expr.longstringliteral, ezP.T3.Expr.longbytesliteral],
    variants: ["'''", '"""'],
  },
  output: {
    check: ezP.T3.Expr.longstringliteral,
  },
}, ezP.DelegateSvg.Expr.shortliteral)

/**
 * When the value did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.longliteral.prototype.didChangeValue = function (block, oldValue, newValue) {
  var F = function(xre, type) {
    var m = XRegExp.exec(newValue, xre)
    if (m) {
      block.ezp.setModifier(block, m.prefix||'')
      block.ezp.setVariant(block, m.delimiter||"'''")
      block.ezp.setContent(block, m.content||'')
      block.ezp.setSubtype(block, type)
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
}


/**
 * Get the subtype from both modifier and content.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} modifier
 * @param {string} content
 * @return one of the two possible subtypes or undefined when the input does not fit.
 */
ezP.DelegateSvg.Expr.longliteral.prototype.getPossibleSubtype = function (block, modifier, content) {
  var delimiter = this.getVariant(block)
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