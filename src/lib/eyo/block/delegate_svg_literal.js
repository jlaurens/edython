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

goog.require('eYo.XRE')
goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Expr')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('Literal', {
  xml: {
    attr: 'literal',
  },
  data: {
    content: {
      init: '',
      xml: false
    }
  }
}, eYo.DelegateSvg)

/**
 * Save the block's data.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {?Object} opt
 */
eYo.DelegateSvg.Literal.prototype.saveData = function (element, opt) {
  eYo.DelegateSvg.Literal.superClass_.saveData.apply(this, arguments)
  if (this.value_p == '') {
    element.setAttribute(eYo.Key.PLACEHOLDER, this.value_d.model.placeholder)
  }
}

/**
 * Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.DelegateSvg.Literal.makeSubclass('numberliteral', {
  data: {
    type: {
      all: [
        eYo.T3.Expr.unset,
        eYo.T3.Expr.integer,
        eYo.T3.Expr.floatnumber,
        eYo.T3.Expr.imagnumber
      ],
      init: eYo.T3.Expr.integer,
      noUndo: true,
      xml: false
    },
    value: {
      init: '',
      main: true,
      placeholder: 0,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var types = this.owner.type_d.getAll()
        var p5e = eYo.T3.Profile.get(newValue, null)
        return ((types.indexOf(p5e.expr) >= 0 || p5e.raw === eYo.T3.Expr.unset) && {validated: newValue}) || null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var type = newValue
          ? eYo.T3.Profile.get(newValue, null).expr
          : eYo.T3.Expr.integer
        this.owner.type_p = type
      },
      synchronize: true,
      xml: {
        text: true // there must be an only one
      }
    }
  },
  fields: {
    value: {
      endEditing: true,
      literal: true // no smart spacing
    }
  },
  output: {
    check: /** @suppress {globalThis} */ function (type) {
      return [type]
    }
  }
})

var names = [
  'integer',
  'floatnumber',
  'imagnumber'
]
names.forEach(key => {
  eYo.DelegateSvg.Expr[key] = eYo.DelegateSvg.Expr.numberliteral
  eYo.DelegateSvg.Manager.register(key)
})

/**
 * Show the editor for the given block.
 * @param {!Blockly.Block} block The block.
 * @private
 */
eYo.DelegateSvg.Expr.numberliteral.prototype.showEditor = function (block) {
  this.value_d.field.showEditor_()
}

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.numberliteral.prototype.getBaseType = function () {
  return this.type_p
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
      all: [
        eYo.T3.Expr.shortstringliteral,
        eYo.T3.Expr.shortformattedliteral,
        eYo.T3.Expr.shortbytesliteral
      ],
      init: eYo.T3.Expr.shortstringliteral,
      synchronize: /** @this{eYo.Data} */ function (newValue) {
        // synchronize the placeholder text
        var p = this.content_p
        if (!p || !p.length) {
          this.owner.content_d.field.placeholderText(true)
        }
      },
      xml: false
    },
    delimiter: {
      all: ["'", '"'],
      init: '"',
      didChange: /** @this{eYo.Data} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.value_d.consolidate()
      },
      synchronize: /** @this{eYo.Data} */ function (newValue) {
        this.synchronize(newValue)
        this.owner.fields.start.setValue(this.toText())
        this.owner.fields.end.setValue(this.toText())
      },
      xml: false,
    },
    prefix: {
      all: ['', 'r', 'u', 'R', 'U', 'f', 'F',
        'fr', 'Fr', 'fR', 'FR', 'rf', 'rF', 'Rf', 'RF',
        'b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'],
      init: '',
      didChange: /** @this{eYo.Data} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.value_d.consolidate()
      },
      validate: /** @this{eYo.Data} */ function (newValue) {
        return (!goog.isDef(this.owner.content_p) || this.owner.validateComponents({
          prefix: newValue}
        )) && {validated: newValue}
      },
      synchronize: /** @this{eYo.Data} */ function (newValue) {
        this..incog = !newValue || !newValue.length
        this.synchronize()
      },
      xml: false,
    },
    content: { // not saved
      placeholder: /** @suppress {globalThis} */ function () {
        if (this.placeholderText_) {
          return this.placeholderText_
        }
        var subtype = this.b_eyo.subtype_p
        return subtype === eYo.T3.Expr.shortbytesliteral || subtype === eYo.T3.Expr.longbytesliteral
          ? eYo.Msg.Placeholder.BYTES : eYo.Msg.Placeholder.STRING
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.value_d.consolidate()
      },
      validate: /** @suppress {globalThis} */ function (newValue) {
        return ((!goog.isDef(this.owner.content_p) || this.owner.validateComponents({
          content: newValue
        })) && {validated: newValue}) || null
      },
      synchronize: true
    },
    value: {
      init: "''",
      main: true,
      validate: /** @this{eYo.Data} */ function (newValue) {
        return goog.isString(newValue)? {validated: newValue}: null
      },
      didChange: /** @this{eYo.Data} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var O = this.owner
        var F = (xre, type, formatted) => {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            O.prefix_p = m.prefix || ''
            O.delimiter_p = m.delimiter || "'"
            O.content_p = m.content || ''
            O.subtype_p = m.formatted ? (formatted || type) : type
            return true
          }
          return false
        }
        if (F(eYo.XRE.shortstringliteralSingle, eYo.T3.Expr.shortstringliteral, eYo.T3.Expr.shortformattedliteral) ||
        F(eYo.XRE.shortstringliteralDouble, eYo.T3.Expr.shortstringliteral, eYo.T3.Expr.shortformattedliteral) ||
        F(eYo.XRE.shortbytesliteralSingle, eYo.T3.Expr.shortbytesliteral) ||
        F(eYo.XRE.shortbytesliteralDouble, eYo.T3.Expr.shortbytesliteral)) {
          this.owner.removeError(eYo.Key.VALUE)
        } else if (newValue && newValue.length) {
          this.owner.setError(eYo.Key.VALUE, 'Bad string|bytes literal: ' +
          (newValue.length > 11 ? newValue.substr(0, 10) + '…' : newValue))
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        var prefix = this.owner.prefix_p
        var delimiter = this.owner.delimiter_p
        var content = this.owner.content_p
        if (goog.isDef(prefix) && goog.isDef(delimiter) && goog.isDef(content)) {
          this.set('' + prefix + delimiter + content + delimiter)
        }
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.shortformattedliteral) {
          this.change(`f''`)
        } else {
          this.change(`''`)
        }
      },
      xml: {
        text: true, // there must be an only one
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
      startEditing: /** @suppress {globalThis} */ function () {
        this.eyo.getDlgt().fields.end.setVisible(false)
      },
      endEditing: /** @suppress {globalThis} */ function () {
        this.eyo.data.set(this.getValue())
        this.eyo.getDlgt().fields.end.setVisible(true)
      },
      literal: true // no smart spacing
    },
    end: {
      css: 'reserved'
    }
  },
  output: {
    check: /** @suppress globalThis */ function () {
      return [this.b_eyo.subtype_p]
    }
  }
})

;[
  'shortstringliteral',
  'shortformattedliteral',
  'shortbytesliteral',
].forEach(t => {
  eYo.DelegateSvg.Expr[t] = eYo.DelegateSvg.Expr.shortliteral
  eYo.DelegateSvg.Manager.register(t)
})

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 */
eYo.DelegateSvg.Expr.shortliteral.prototype.getBaseType = function () {
  return this.subtype_p
}

/**
 * Validate the components.
 * For edython.
 * @param {?kvargs} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.shortliteral.prototype.validateComponents = function(kvargs) {
  var prefix = kvargs.prefix || this.prefix_p
  var delimiter = kvargs.delimiter || this.delimiter_p
  var content = kvargs.content || this.content_p
  var value = `${prefix}${delimiter}${content}${delimiter}`
  return (!!XRegExp.exec(value, eYo.XRE.shortbytesliteralSingle) && eYo.T3.Expr.shortbytesliteral) ||
  (!!XRegExp.exec(value, eYo.XRE.shortbytesliteralDouble) && eYo.T3.Expr.shortbytesliteral) ||
  (!!XRegExp.exec(value, eYo.XRE.shortstringliteralSingle) && eYo.T3.Expr.shortstringliteral) ||
  (!!XRegExp.exec(value, eYo.XRE.shortstringliteralDouble) && eYo.T3.Expr.shortstringliteral)
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
eYo.DelegateSvg.Expr.shortliteral.prototype.makeTitle = function (variant) {
  return eYo.Do.createSPAN(variant + '…' + variant, 'eyo-code')
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Literal.literalPopulateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  mgr.populateProperties(block, 'delimiter')
  mgr.separate()
  var current = this.prefix_p
  var can_b = this.validateComponents({
    prefix: 'b'
  })
  var can_f = this.validateComponents({
    prefix: 'f'
  })
  var item = (msg, prefix) => {
    if (prefix !== current) {
      var title = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN(msg, 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
      )
      return mgr.newMenuItem(title, () => {
        this.prefix_p = prefix
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
eYo.DelegateSvg.Expr.shortliteral.prototype.populateContextMenuFirst_ = function (mgr) {
  eYo.DelegateSvg.Literal.literalPopulateContextMenuFirst_.call(this, mgr)
  eYo.DelegateSvg.Expr.shortliteral.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

goog.provide('eYo.DelegateSvg.Expr.longliteral')

/**
 * Class for a DelegateSvg, longliteral (expression).
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.DelegateSvg.Expr.shortliteral.makeSubclass('longliteral', {
  data: {
    subtype: {
      all: [
        eYo.T3.Expr.longstringliteral,
        eYo.T3.Expr.longformattedliteral,
        eYo.T3.Expr.longbytesliteral
      ],
      init: eYo.T3.Expr.longstringliteral
    },
    delimiter: {
      all: ["'''", '"""'],
      init: '"""'
    },
    value: {
      init: "''''''",
      main: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var O = this.owner
        var F = (xre, type, formatted) => {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            O.prefix_p = m.prefix || ''
            O.delimiter_p = m.delimiter || "'''"
            O.content_p = m.content || ''
            O.subtype_p = m.formatted ? (formatted || type) : type
            return true
          }
          return false
        }
        if (F(eYo.XRE.longstringliteralSingle, eYo.T3.Expr.longstringliteral, eYo.T3.Expr.longformattedliteral) ||
        F(eYo.XRE.longstringliteralDouble, eYo.T3.Expr.longstringliteral, eYo.T3.Expr.longformattedliteral) ||
        F(eYo.XRE.longbytesliteralSingle, eYo.T3.Expr.longbytesliteral) ||
        F(eYo.XRE.longbytesliteralDouble, eYo.T3.Expr.longbytesliteral)) {
          this.owner.removeError(eYo.Key.VALUE)
        } else if (newValue && newValue.length) {
          this.owner.setError(eYo.Key.VALUE, 'Bad string|bytes literal: ' +
          (newValue.length > 11 ? newValue.substr(0, 10) + '…' : newValue))
        }
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Expr.longformattedliteral) {
          this.change(`f''''''`)
        } else {
          this.change(`''''''`)
        }
      }
    }
  },
  output: {
    check: /** @suppress globalThis */ function () {
      return [this.b_eyo.subtype_p]
    }
  }
})

/**
 * Validate the components.
 * For edython.
 * @param {?kvargs} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.longliteral.prototype.validateComponents = function(kvargs) {
  var prefix = kvargs.prefix || this.prefix_p
  var delimiter = kvargs.delimiter || this.delimiter_p
  var content = kvargs.content || this.content_p
  var value = `${prefix}${delimiter}${content}${delimiter}`
  return (!!XRegExp.exec(value, eYo.XRE.longbytesliteralSingle) && eYo.T3.Expr.longbytesliteral) ||
  (!!XRegExp.exec(value, eYo.XRE.longbytesliteralDouble) && eYo.T3.Expr.longbytesliteral) ||
  (!!XRegExp.exec(value, eYo.XRE.longstringliteralSingle) && eYo.T3.Expr.longstringliteral) ||
  (!!XRegExp.exec(value, eYo.XRE.longstringliteralDouble) && eYo.T3.Expr.longstringliteral)
}

;[
  'longstringliteral',
  'longformattedliteral',
  'longbytesliteral',
].forEach(t => {
  eYo.DelegateSvg.Expr[t] = eYo.DelegateSvg.Expr.longliteral
  eYo.DelegateSvg.Manager.register(t)
})

eYo.DelegateSvg.Literal.T3s = [
  eYo.T3.Expr.shortliteral,
  eYo.T3.Expr.longliteral,
  eYo.T3.Expr.numberliteral
]
