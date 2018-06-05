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

goog.provide('eYo.DelegateSvg.Literal')
goog.provide('eYo.DelegateSvg.Expr.numberliteral')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Expr')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('Literal', {
  xml: {
    tag: 'literal',
  },
  data: {
    content: {
      init: ''
    }
  }
}, eYo.DelegateSvg)

/**
 * The xml type of this block, as it should appear in the saved data.
 * Numbers have no xml type.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.Literal.prototype.xmlType = function (block) {
  return null
}

/**
 * Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.DelegateSvg.Literal.makeSubclass('numberliteral', {
  data: {
    subtype: {
      all: [eYo.T3.Expr.integer, eYo.T3.Expr.floatnumber, eYo.T3.Expr.imagnumber],
      noUndo: true
    },
    value: {
      main: true,
      init: '0',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var subtypes = this.data.subtype.getAll()
        var subtype = eYo.Do.typeOfString(newValue)
        return ((subtypes.indexOf(subtype) >= 0) && {validated: newValue}) || null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var type = newValue ? eYo.Do.typeOfString(newValue) : eYo.T3.Expr.integer
        this.data.subtype.set(type)
      },
      synchronize: true,
      xml: {
        text: true,
      },
    }
  },
  fields: {
    value: {
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.NUMBER
    }
  },
  output: {
    check: eYo.T3.Expr.integer
  }
})

eYo.DelegateSvg.Expr.integer = eYo.DelegateSvg.Expr.floatnumber = eYo.DelegateSvg.Expr.imagnumber = eYo.DelegateSvg.Expr.numberliteral
eYo.DelegateSvg.Manager.register('integer')
eYo.DelegateSvg.Manager.register('floatnumber')
eYo.DelegateSvg.Manager.register('imagnumber')

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.DelegateSvg.Expr.numberliteral.prototype.showEditor = function (block) {
  this.data.value.field.showEditor_()
}

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.numberliteral.prototype.consolidateType = function (block) {
  var subtype = this.data.subtype.get()
  block.outputConnection.setCheck(subtype)
  eYo.DelegateSvg.Expr.term.superClass_.consolidateType.call(this, block)
}

goog.provide('eYo.DelegateSvg.Expr.shortliteral')

/**
 * Class for a DelegateSvg, string litteral.
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.DelegateSvg.Literal.makeSubclass('shortliteral', {
  data: {
    subtype: {
      all: [eYo.T3.Expr.shortstringliteral, eYo.T3.Expr.shortbytesliteral],
      getPossible: /** @suppress {globalThis} */ function (prefix, content) {
        var delimiter = this.data.delimiter.get()
        var value = '' + prefix + delimiter + content + delimiter
        return (!!XRegExp.exec(value, eYo.XRE.shortbytesliteralSingle) && eYo.T3.Expr.shortbytesliteral) ||
        (!!XRegExp.exec(value, eYo.XRE.shortbytesliteralDouble) && eYo.T3.Expr.shortbytesliteral) ||
        (!!XRegExp.exec(value, eYo.XRE.shortstringliteralSingle) && eYo.T3.Expr.shortstringliteral) ||
        (!!XRegExp.exec(value, eYo.XRE.shortstringliteralDouble) && eYo.T3.Expr.shortstringliteral)
      }
    },
    delimiter: {
      all: ["'", '"'],
      didChange: /** @this{eYo.Data} */ function (oldValue, newValue) {
        this.data.value.consolidate()
      },
      synchronize: /** @this{eYo.Data} */ function (newValue) {
        this.owner_.fields.start.setValue(this.toText())
        this.owner_.fields.end.setValue(this.toText())
      },
      xml: false,
    },
    prefix: {
      all: ['', 'r', 'u', 'R', 'U', 'f', 'F',
        'fr', 'Fr', 'fR', 'FR', 'rf', 'rF', 'Rf', 'RF',
        'b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'],
      didChange: /** @this{eYo.Data} */ function (oldValue, newValue) {
        this.data.value.consolidate()
      },
      validate: /** @this{eYo.Data} */ function (newValue) {
        var content = this.data.content.get()
        return (!goog.isDef(content) || this.data.subtype.model.getPossible.call(this, newValue, content)) && {validated: newValue}
      },
      synchronize: /** @this{eYo.Data} */ function (newValue) {
        this.synchronize()
        this.owner_.fields.prefix.setVisible(!!newValue && !!newValue.length)
      },
      xml: false,
    },
    content: {
      init: '',
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.data.value.consolidate()
      },
      validate: /** @suppress {globalThis} */ function (newValue) {
        var prefix = this.data.prefix.get()
        return ((!goog.isDef(prefix) || this.data.subtype.model.getPossible.call(this, prefix, newValue)) && {validated: newValue}) || null
      },
      synchronize: true,
      xml: false,
    },
    value: {
      main: true,
      init: "''",
      validate: /** @this{eYo.Data} */ function (newValue) {
        return goog.isString(newValue)? {validated: newValue}: null
      },
      didChange: /** @this{eYo.Data} */ function (oldValue, newValue) {
        var data = this.data
        var F = function (xre, type) {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            data.prefix.set(m.prefix || '')
            data.delimiter.set(m.delimiter || "'")
            data.content.set(m.content || '')
            data.subtype.set(type)
            return true
          }
          return false
        }
        if (F(eYo.XRE.shortstringliteralSingle, eYo.T3.Expr.shortstringliteral) ||
        F(eYo.XRE.shortstringliteralDouble, eYo.T3.Expr.shortstringliteral) ||
        F(eYo.XRE.shortbytesliteralSingle, eYo.T3.Expr.shortbytesliteral) ||
        F(eYo.XRE.shortbytesliteralDouble, eYo.T3.Expr.shortbytesliteral)) {
          this.owner_.removeError(this.owner_.block_, eYo.Key.VALUE)
        } else if (newValue && newValue.length) {
          this.owner_.setError(this.owner_.block_, eYo.Key.VALUE, 'Bad string|bytes literal: ' +
          (newValue.length > 11 ? newValue.substr(0, 10) + '…' : newValue))
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        var prefix = this.data.prefix.get()
        var delimiter = this.data.delimiter.get()
        var content = this.data.content.get()
        if (goog.isDef(prefix) && goog.isDef(delimiter) && goog.isDef(content)) {
          this.set('' + prefix + delimiter + content + delimiter)
        }
      },
      xml: {
        text: true,
      },
    },
  },
  fields: {
    prefix: {
      css: 'reserved'
    },
    start: {
      css: 'reserved'
    },
    content: { // this is the only really unordered field
      placeholder: /** @suppress {globalThis} */ function () {
        var block = this.sourceBlock_
        var eyo = block.eyo
        if (this.placeholderText_) {
          return this.placeholderText_
        }
        var subtype = eyo.data.subtype.get()
        return subtype === eYo.T3.Expr.shortbytesliteral || subtype === eYo.T3.Expr.shortbytesliteral
          ? eYo.Msg.Placeholder.BYTES : eYo.Msg.Placeholder.STRING
      },
      validate: true,
      startEditing: /** @suppress {globalThis} */ function () {
        this.eyo.getDlgt().fields.end.setVisible(false)
      },
      endEditing: /** @suppress {globalThis} */ function () {
        this.eyo.data.set(this.getValue())
        this.eyo.getDlgt().fields.end.setVisible(true)
      }
    },
    end: {
      css: 'reserved'
    }
  },
  output: {
    check: eYo.T3.Expr.shortstringliteral
  }
})

eYo.DelegateSvg.Expr.shortstringliteral = eYo.DelegateSvg.Expr.shortbytesliteral = eYo.DelegateSvg.Expr.shortliteral
eYo.DelegateSvg.Manager.register('shortstringliteral')
eYo.DelegateSvg.Manager.register('shortbytesliteral')

/**
 * Set the type dynamically from the prefix.
 * @param {!Blockly.Block} block the owner of the receiver
 */
eYo.DelegateSvg.Expr.shortliteral.prototype.consolidateType = function (block) {
  var type = this.data.subtype.get()
  block.outputConnection.setCheck([type])
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
eYo.DelegateSvg.Expr.shortliteral.prototype.makeTitle = function (block, variant) {
  return eYo.Do.createSPAN(variant + '…' + variant, 'eyo-code')
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Literal.literalPopulateContextMenuFirst_ = function (block, mgr) {
  mgr.populateProperties(block, 'delimiter')
  mgr.separate()
  var current = this.data.prefix.get()
  var content = this.data.content.get()
  var subtype = this.data.subtype
  var can_b = !!subtype.model.getPossible.call(subtype, 'b', content)
  var can_f = !!subtype.model.getPossible.call(subtype, 'f', content)
  var item = function (msg, prefix) {
    if (prefix !== current) {
      var title = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN(msg, 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
      )
      return new eYo.MenuItem(title, function () {
        block.eyo.data.prefix.set(prefix)
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
  } else if (['rf', 'fr'].indexOf(current.toLowerCase()) < 0) {
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
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.shortliteral.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, block, mgr)
  eYo.DelegateSvg.Expr.shortliteral.superClass_.populateContextMenuFirst_.call(this, block, mgr)
  return true
}

goog.provide('eYo.DelegateSvg.Expr.longliteral')

/**
 * Class for a DelegateSvg, docstring (expression).
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.DelegateSvg.Expr.shortliteral.makeSubclass('longliteral', {
  data: {
    subtype: {
      all: [eYo.T3.Expr.longstringliteral, eYo.T3.Expr.longbytesliteral],
      getPossible: /** @suppress {globalThis} */ function (prefix, content) {
        var delimiter = this.data.delimiter.get()
        var value = '' + prefix + delimiter + content + delimiter
        return (!!XRegExp.exec(value, eYo.XRE.longbytesliteralSingle) && eYo.T3.Expr.longbytesliteral) ||
        (!!XRegExp.exec(value, eYo.XRE.longbytesliteralDouble) && eYo.T3.Expr.longbytesliteral) ||
        (!!XRegExp.exec(value, eYo.XRE.longstringliteralSingle) && eYo.T3.Expr.longstringliteral) ||
        (!!XRegExp.exec(value, eYo.XRE.longstringliteralDouble) && eYo.T3.Expr.longstringliteral)
      }
    },
    delimiter: {
      all: ["'''", '"""']
    },
    value: {
      init: "''''''",
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var data = this.data
        var F = function (xre, type) {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            data.prefix.set(m.prefix || '')
            data.delimiter.set(m.delimiter || "'''")
            data.content.set(m.content || '')
            data.subtype.set(type)
            return true
          }
          return false
        }
        if (F(eYo.XRE.longstringliteralSingle, eYo.T3.Expr.longstringliteral) ||
        F(eYo.XRE.longstringliteralDouble, eYo.T3.Expr.longstringliteral) ||
        F(eYo.XRE.longbytesliteralSingle, eYo.T3.Expr.longbytesliteral) ||
        F(eYo.XRE.longbytesliteralDouble, eYo.T3.Expr.longbytesliteral)) {
          this.owner_.removeError(this.owner_.block_, eYo.Key.VALUE)
        } else if (newValue && newValue.length) {
          this.owner_.setError(this.owner_.block_, eYo.Key.VALUE, 'Bad string|bytes literal: ' +
          (newValue.length > 11 ? newValue.substr(0, 10) + '…' : newValue))
        }
      }
    }
  },
  output: {
    check: eYo.T3.Expr.longstringliteral
  }
})

eYo.DelegateSvg.Expr.longstringliteral = eYo.DelegateSvg.Expr.longbytesliteral = eYo.DelegateSvg.Expr.longliteral
eYo.DelegateSvg.Manager.register('longstringliteral')
eYo.DelegateSvg.Manager.register('longbytesliteral')

eYo.DelegateSvg.Literal.T3s = [
  eYo.T3.Expr.shortliteral,
  eYo.T3.Expr.longliteral,
  eYo.T3.Expr.numberliteral
]
