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

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Literal.prototype.initBlock = function (block) {
  ezP.DelegateSvg.Literal.superClass_.initBlock.call(this, block)
  block.ezp.setupType(block)
}

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} optNewType
 * @constructor
 */
ezP.DelegateSvg.Literal.prototype.setupType = function (block, optNewType) {
  ezP.DelegateSvg.Literal.superClass_.setupType.call(this, block, optNewType)
  this.xmlType_ = ezP.T3.Expr.literal
}

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
    m_1: {
      number: '0',
    }
  },
  output: {
    check: ezP.T3.Expr.integer,
  }
}, ezP.DelegateSvg.Literal)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.numberliteral, ezP.DelegateSvg.Expr.numberliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.integer, ezP.DelegateSvg.Expr.numberliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.floatnumber, ezP.DelegateSvg.Expr.numberliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.imagnumber, ezP.DelegateSvg.Expr.numberliteral)

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized..
 * @constructor
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.setupType = function (block) {
  this.consolidateType_(block)
  ezP.DelegateSvg.Expr.numberliteral.superClass_.setupType.call(this, block)
}

/**
 * The block may change type depending on.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.consolidateType_ = function (block) {
  if (block.outputConnection) { // this is called once too early
    var value = block.ezp.uiModel.m_1.fields.number.getValue()
    if (XRegExp.test(value, ezP.XRE.integer) &&
    block.type !== ezP.T3.Expr.integer) {
      block.type = ezP.T3.Expr.integer
    } else if (XRegExp.test(value, ezP.XRE.floatnumber) &&
    block.type !== ezP.T3.Expr.floatnumber) {
      block.type = ezP.T3.Expr.floatnumber
    } else if (XRegExp.test(value, ezP.XRE.imagnumber) &&
    block.type !== ezP.T3.Expr.imagnumber) {
      block.type = ezP.T3.Expr.imagnumber
    }
    block.outputConnection.setCheck([block.type])
  }
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.getSubtype = function (block) {
  return block.ezp.uiModel.m_1.fields.number.getValue()
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.setSubtype = function (block, subtype) {
  if (XRegExp.test(subtype, ezP.XRE.integer)) {
    block.ezp.uiModel.m_1.fields.number.setValue(subtype)
    if (block.type !== ezP.T3.Expr.integer) {
      block.ezp.setupType(block, ezP.T3.Expr.integer)
    }
    return true
  } else if (XRegExp.test(subtype, ezP.XRE.floatnumber)) {
    block.ezp.uiModel.m_1.fields.number.setValue(subtype)
    if (block.type !== ezP.T3.Expr.floatnumber) {
      block.ezp.setupType(block,  ezP.T3.Expr.floatnumber)
    }
    return true
  } else if (XRegExp.test(subtype, ezP.XRE.imagnumber)) {
    block.ezp.uiModel.m_1.fields.number.setValue(subtype)
    if (block.type !== ezP.T3.Expr.imagnumber) {
      block.ezp.setupType(block,  ezP.T3.Expr.imagnumber)
    }
    return true
  }
  return false
}

/**
 * Set the type dynamically from the content of some field.
 * @param {!Blockly.Block} block the owner of the receiver
 * @param {!string} name the name of the field that did change
 * @param {!string} oldValue the value before the change
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.fieldValueDidChange = function(block, name, oldValue) {
  var text = block.getField(name).getText()
  var F = function(re, type) {
    if (XRegExp.test(text, re) &&
  block.type !== type) {
      block.ezp.setupType(block, type)
      return true
    }
  }
  F(ezP.XRE.integer, ezP.T3.Expr.integer)
  || F(ezP.T3.Expr.floatnumber, ezP.T3.Expr.floatnumber)
  || F(ezP.T3.Expr.imagnumber, ezP.T3.Expr.imagnumber)
}

goog.provide('ezP.DelegateSvg.Expr.shortliteral')

/**
* Class for a DelegateSvg, string litteral.
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('shortliteral', {
  inputs: {
    m_1: {
      key: ezP.Key.PREFIX,
      label: "",
      css_class: 'ezp-code-reserved',
    },
    m_3: {
      start: "'",
      string: '',
      end: "'",
      css_class: 'ezp-code-reserved',
    },
  },
  output: {
    check: ezP.T3.Expr.shortstringliteral,
  }
}, ezP.DelegateSvg.Literal)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.shortstringliteral, ezP.DelegateSvg.Expr.shortliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.shortbytesliteral, ezP.DelegateSvg.Expr.shortliteral)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.initBlock = function (block) {
  block.ezp.setupType(block)
  ezP.DelegateSvg.Expr.shortliteral.superClass_.initBlock.call(this, block)
  if (block.type === ezP.T3.Expr.shortbytesliteral) {
    var field = this.uiModel.m_1.fields.label
    var prefix = field.getValue()
    if (prefix.toLowerCase().indexOf('b')<0) {
      field.setValue(prefix + 'b')
    }
  }
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_ = function (block, mgr) {
  var start = this.uiModel.m_3.fields.start
  var end = this.uiModel.m_3.fields.end
  var code = this.uiModel.m_3.fields.string
  var can_b = !!XRegExp.exec(code.getValue(), ezP.XRE.bytes)
  var single = start.getText() === "'"
  var menuItem = new ezP.MenuItem(
    ezP.Do.createSPAN(single? ezP.Msg.USE_DOUBLE_QUOTES: ezP.Msg.USE_SINGLE_QUOTE, 'ezp-code'), function() {
      Blockly.Events.setGroup(true)
      var oldValue = start.getValue()
      var newValue = single? '"': "'"
      start.setValue(newValue)
      end.setValue(newValue)
      Blockly.Events.setGroup(false)
    })
  mgr.addChild(menuItem, true)
  mgr.separate()
  var prefix = this.uiModel.m_1.fields.label
  var oldValue = prefix.getValue()
  var insert = function (newValue) {
    switch(oldValue) {
      case 'u': case 'U': return true
      case 'r': case 'R':
      if (newValue === 'f') newValue = 'rf'
      else if (newValue === 'b') newValue = 'rb'
      else return
      break
      case 'f': case 'F':
      if (newValue !== 'r') return true
      newValue = 'rf'
      break
      case 'b': case 'B':
      if (newValue !== 'r') return true
      newValue = 'rb'
      break
    }
    prefix.setValue(newValue)
  }
  var remove = function(key) {
    var newValue = ''
    switch(oldValue) {
      case 'u': case 'U':
      break
      case 'r': case 'R':
      if (key !== 'r') return true
      break
      case 'f': case 'F':
      if (key !== 'f') return true
      break
      case 'b': case 'B':
      if (key !== 'b') return true
      break
      default:
      if (key === 'f' || key === 'b') newValue = 'r'
      else if (['rf', 'fr',].indexOf(oldValue.toLowerCase())<0) newValue = 'b'
      else newValue = 'f'
    }
    prefix.setValue(newValue)
    return true
  }
  var item = function(msg, action) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      ezP.Do.createSPAN(msg, 'ezp-code'),
      goog.dom.createTextNode(' '+ezP.Msg.AT_THE_LEFT),
    )
    return new ezP.MenuItem(content, function() {
      action(msg)
    })
  }
  if (!oldValue.length) {
    // mgr.addInsertChild(item('u', insert))
    mgr.addInsertChild(item('r', insert))
    mgr.addInsertChild(item('f', insert))
    if (can_b) {
      mgr.addInsertChild(item('b', insert))
    }
  } else if (oldValue === 'u') {
    mgr.addRemoveChild(item('u', remove))
  } else if (oldValue === 'r') {
    mgr.addInsertChild(item('f', insert))
    if (can_b) {
      mgr.addInsertChild(item('b', insert))
    }
    mgr.addRemoveChild(item('r', remove))
  } else if (oldValue === 'f') {
    mgr.addInsertChild(item('r', insert))
    mgr.addRemoveChild(item('f', remove))
  } else if (oldValue === 'b') {
    mgr.addInsertChild(item('r', insert))
    mgr.addRemoveChild(item('b', remove))
  } else {
    mgr.addRemoveChild(item('r', remove))
    if (['rf', 'fr',].indexOf(oldValue.toLowerCase())<0) {
      mgr.addRemoveChild(item('b', remove))
    } else {
      mgr.addRemoveChild(item('f', remove))
    }
  }
  mgr.shouldSeparateInsert()
  return true
}
ezP.DelegateSvg.Expr.shortliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, block, mgr)
  ezP.DelegateSvg.Expr.shortliteral.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.startEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(false)
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.endEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(true)
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.shortliteral.superClass_.willRender_.call(this, block)
  var field = this.uiModel.m_1.fields.label
  field.setVisible(field.getValue().length)
}

/**
 * Set the type dynamically from the content of some field.
 * @param {!Blockly.Block} block the owner of the receiver
 * @param {!string} name the name of the field that did change
 * @param {!string} oldValue the value before the change
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.fieldValueDidChange = function(block, name, oldValue) {
  var value = block.getField(name).getText().toLowerCase()
  if (value === 'b' || value.length !==1 && ['', 'rf', 'fr'].indexOf(value)<0) {
    block.type = ezP.T3.Expr.shortbytesliteral
  } else {
    block.type = ezP.T3.Expr.shortstringliteral
  }
  block.ezp.setupType(block)
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.getSubtype = function (block) {
  return block.ezp.toPythonExpression(block)
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * Undo support ?
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.shortliteral.prototype.setSubtype = function (block, subtype) {
  var start = this.uiModel.m_3.fields.start
  var end = this.uiModel.m_3.fields.end
  var code = this.uiModel.m_3.fields.string
  var prefix = this.uiModel.m_1.fields.label
  var F = function(re, type) {
    var m = XRegExp.exec(subtype, re)
    if (m) {
      prefix.setValue(m.prefix||'')
      start.setValue(m.delimiter||"'")
      end.setValue(m.delimiter||"'")
      code.setValue(m.content||'')
      block.ezp.setupType(block, type)
      return true  
    }
    return false
  }
  return F(ezP.XRE.shortstringliteral, ezP.T3.Expr.shortstringliteral)
  || F(ezP.XRE.shortbytesliteral, ezP.T3.Expr.shortbytesliteral)
}

goog.provide('ezP.DelegateSvg.Expr.longliteral')

/**
* Class for a DelegateSvg, docstring (expression).
* For ezPython.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @constructor
*/
ezP.DelegateSvg.Manager.makeSubclass('longliteral', {
  inputs: {
    m_1: {
      key: ezP.Key.PREFIX,
      label: "",
      css_class: 'ezp-code-reserved',
    },
    m_3: {
      start: "'''",
      string: '',
      end: "'''",
      css_class: 'ezp-code-reserved',
    },
  },
  output: {
    check: ezP.T3.Expr.longstringliteral,
  },
}, ezP.DelegateSvg.Literal)

ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.longstringliteral, ezP.DelegateSvg.Expr.longliteral)
ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr.longbytesliteral, ezP.DelegateSvg.Expr.longliteral)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.longliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  ezP.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, block, mgr)
  ezP.DelegateSvg.Expr.longliteral.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.longliteral.prototype.startEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(false)
}

/**
 * On end editing.
 * @param {!Blockly.Block} block owner of the delegate.
 * @param {!Blockly.Field} field The field in editing mode.
 */
ezP.DelegateSvg.Expr.longliteral.prototype.endEditingField = function (block, field) {
  this.uiModel.m_3.fields.end.setVisible(true)
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.Expr.longliteral.prototype.willRender_ = function (block) {
  ezP.DelegateSvg.Expr.longliteral.superClass_.willRender_.call(this, block)
  var field = this.uiModel.m_1.fields.label
  field.setVisible(field.getValue().length)
}

/**
 * Set the type dynamically from the content of some field.
 * @param {!Blockly.Block} block the owner of the receiver
 * @param {!string} name the name of the field that did change
 * @param {!string} oldValue the value before the change
 */
ezP.DelegateSvg.Expr.longliteral.prototype.fieldValueDidChange = function(block, name, oldValue) {
  var value = block.getField(name).getText().toLowerCase()
  if (value === 'b' || value.length !==1 && ['', 'rf', 'fr'].indexOf(value)<0) {
    block.type = ezP.T3.Expr.longbytesliteral
  } else {
    block.type = ezP.T3.Expr.longstringliteral
  }
  block.ezp.setupType(block)
}

/**
 * Get the subtype of the block.
 * The default implementation does nothing.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is return, when defined or not null.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.DelegateSvg.Expr.longliteral.prototype.getSubtype = function (block) {
  return this.uiModel.m_3.fields.string.getValue()
}

/**
 * Set the subtype of the block.
 * Subclassers may use this to fine tune their own settings.
 * The only constrain is that a string is expected.
 * Undo support ?
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} subtype Is a function.
 * @return true if the receiver supports subtyping, false otherwise
 */
ezP.DelegateSvg.Expr.longliteral.prototype.setSubtype = function (block, subtype) {
  var start = this.uiModel.m_3.fields.start
  var end = this.uiModel.m_3.fields.end
  var code = this.uiModel.m_3.fields.string
  var prefix = this.uiModel.m_1.fields.label
  var F = function(re, type) {
    var m = XRegExp.exec(subtype, re)
    if (m) {
      prefix.setValue(m.prefix||'')
      start.setValue(m.delimiter||"'")
      end.setValue(m.delimiter||"'")
      code.setValue(m.content||'')
      block.ezp.setupType(block, type)
      return true  
    }
    return false
  }
  return F(ezP.XRE.longstringliteral, ezP.T3.Expr.longstringliteral)
  || F(ezP.XRE.longbytesliteral, ezP.T3.Expr.longbytesliteral)
}

/**
 * Get the value of the block.
 * Used for simple blocks, form and to dom.
 * Default implementation returns the subtype.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {?string} value
 */
ezP.DelegateSvg.Expr.longliteral.prototype.getValue = function (block) {
  return block.ezp.toPythonExpression(block)
}

/**
 * Set the value of the block.
 * Used for simple blocks, form and to dom.
 * Default implementation sets the subtype.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {?string} value
 */
ezP.DelegateSvg.Expr.longliteral.prototype.setValue = function (block, value) {
  var del = "'''", text = value
  if (value.length > 5) {
    del = value.substr(0, 3)
    if (del === '"""' || del === "'''") {
      text = value.substr(3, value.length-6)
    }
  }
  block.ezp.uiModel.m_3.fields.start.setValue(del)
  block.ezp.uiModel.m_3.fields.end.setValue(del)
  block.ezp.setSubtype(block, value) || block.ezp.setSubtype(block, text)
}

ezP.DelegateSvg.Literal.T3s = [
  ezP.T3.Expr.shortstringliteral,
  ezP.T3.Expr.shortbytesliteral,
  ezP.T3.Expr.longstringliteral,
  ezP.T3.Expr.longbytesliteral,
  ezP.T3.Expr.numberliteral,
  ezP.T3.Expr.integer,
  ezP.T3.Expr.floatnumber,
  ezP.T3.Expr.imagnumber,
  ]