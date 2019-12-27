/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'


eYo.require('Expr')

eYo.forwardDeclare('XRE')
eYo.forwardDeclare('Msg')

goog.forwardDeclare('goog.dom')

/**
 * @name{eYo.Expr.Literal}
 * @constructor
 * Class for a Delegate, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('Literal', {
  xml: {
    attr: 'literal',
  },
  data: {
    content: {
      init: '',
      xml: false
    }
  }
})

/**
 * Save the brick's data.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {Object} [opt]
 */
eYo.Expr.Literal.prototype.saveData = function (element, opt) {
  eYo.Expr.Literal.superProto_.saveData.apply(this, arguments)
  if (this.value_p == '') {
    element.setAttribute(eYo.Key.PLACEHOLDER, this.value_d.model.placeholder)
  }
}

/**
 * Class for a Delegate, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.Expr.Literal.makeSubclass('numberliteral', {
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
      validate (after) /** @suppress {globalThis} */ {
        var types = this.brick.type_d.getAll()
        var p5e = eYo.T3.Profile.get(after, null)
        return types.indexOf(p5e.expr) >= 0 || p5e.raw === eYo.T3.Expr.unset ? after : eYo.INVALID
      },
      didChange (before, after) /** @suppress {globalThis} */ {
        this.didChange(before, after)
        var type = after
          ? eYo.T3.Profile.get(after, null).expr
          : eYo.T3.Expr.integer
        this.brick.type_p = type
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
  out: {
    check (type) /** @suppress {globalThis} */ {
      return [type]
    }
  }
})

;[
  'integer',
  'floatnumber',
  'imagnumber'
].forEach(k => {
  eYo.C9r.register(k, (eYo.Expr[k] = eYo.Expr.numberliteral))
})

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {string} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 */
eYo.Expr.numberliteral.prototype.getBaseType = function () {
  return this.type_p
}

/**
 * Class for a Delegate, string litteral.
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.Expr.Literal.makeSubclass('shortliteral', {
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
          this.brick.content_d.field.getPlaceholderText(true)
        }
      },
      xml: false
    },
    delimiter: {
      all: ["'", '"'],
      init: '"',
      didChange: /** @this{eYo.Data} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.brick.value_d.consolidate()
      },
      synchronize: /** @this{eYo.Data} */ function (newValue) {
        this.synchronize(newValue)
        var f4s = this.brick.fields
        f4s.start.text = f4s.end.text = this.toText()
      },
      xml: false,
    },
    prefix: {
      all: ['', 'r', 'u', 'R', 'U', 'f', 'F',
        'fr', 'Fr', 'fR', 'FR', 'rf', 'rF', 'Rf', 'RF',
        'b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'],
      init: '',
      didChange (before, after) { /** @this{eYo.Data} */
        this.didChange(before, after)
        this.brick.value_d.consolidate()
      },
      validate (before) { /** @this{eYo.Data} */
        return !goog.isDef(this.brick.content_p) || this.brick.validateComponents({
          prefix: before}
        ) ? before : eYo.INVALID
      },
      synchronize (after) { /** @this{eYo.Data} */ 
        this.incog = !after || !after.length
        this.synchronize()
      },
      xml: false,
    },
    content: { // not saved
      placeholder () /** @suppress {globalThis} */ {
        var subtype = this.brick.subtype_p
        return subtype === eYo.T3.Expr.shortbytesliteral || subtype === eYo.T3.Expr.longbytesliteral
          ? eYo.Msg.Placeholder.BYTES : eYo.Msg.Placeholder.STRING
      },
      didChange (before, after) /** @suppress {globalThis} */ {
        this.didChange(before, after)
        this.brick.value_d.consolidate()
      },
      validate (after) /** @suppress {globalThis} */ {
        return !goog.isDef(this.brick.content_p) || this.brick.validateComponents({
          content: after
        }) ? after : eYo.INVALID
      },
      synchronize: true
    },
    value: {
      init: "''",
      main: true,
      validate (after) { /** @this{eYo.Data} */
        return eYo.isStr(after)? after: eYo.INVALID
      },
      didChange (before, after) {/** @this{eYo.Data} */ 
        this.didChange(before, after)
        var b3k = this.brick
        var F = (xre, type, formatted) => {
          var m = XRegExp.exec(after, xre)
          if (m) {
            b3k.prefix_p = m.prefix || ''
            b3k.delimiter_p = m.delimiter || "'"
            b3k.content_p = m.content || ''
            b3k.subtype_p = m.formatted ? (formatted || type) : type
            return true
          }
          return false
        }
        if (F(eYo.XRE.shortstringliteralSingle, eYo.T3.Expr.shortstringliteral, eYo.T3.Expr.shortformattedliteral) ||
        F(eYo.XRE.shortstringliteralDouble, eYo.T3.Expr.shortstringliteral, eYo.T3.Expr.shortformattedliteral) ||
        F(eYo.XRE.shortbytesliteralSingle, eYo.T3.Expr.shortbytesliteral) ||
        F(eYo.XRE.shortbytesliteralDouble, eYo.T3.Expr.shortbytesliteral)) {
          this.brick.removeError(eYo.Key.VALUE)
        } else if (after && after.length) {
          this.brick.setError(eYo.Key.VALUE, 'Bad string|bytes literal: ' +
          (after.length > 11 ? after.substr(0, 10) + '…' : after))
        }
      },
      consolidate () /** @suppress {globalThis} */ {
        var prefix = this.brick.prefix_p
        var delimiter = this.brick.delimiter_p
        var content = this.brick.content_p
        if (goog.isDef(prefix) && goog.isDef(delimiter) && goog.isDef(content)) {
          this.set('' + prefix + delimiter + content + delimiter)
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.T3.Expr.shortformattedliteral) {
          this.doChange(`f''`)
        } else {
          this.doChange(`''`)
        }
      },
      xml: {
        text: true, // there must be an only one
      },
    },
  },
  fields: {
    prefix: {
      reserved: ''
    },
    start: {
      reserved: ''
    },
    content: { // this is the only really unordered field
      startEditing () /** @suppress {globalThis} */ {
        this.brick.end_f.visible = false
      },
      endEditing () /** @suppress {globalThis} */ {
        this.data.set(this.getValue())
        this.brick.end_f.visible = true
      },
      literal: true // no smart spacing
    },
    end: {
      reserved: ''
    }
  },
  out: {
    check: /** @suppress globalThis */ function () {
      return [this.brick.subtype_p]
    }
  }
})

;[
  'shortstringliteral',
  'shortformattedliteral',
  'shortbytesliteral',
].forEach(k => {
  eYo.C9r.register(k, (eYo.Expr[k] = eYo.Expr.shortliteral))
})

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {string} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 */
eYo.Expr.shortliteral.prototype.getBaseType = function () {
  return this.subtype_p
}

/**
 * Validate the components.
 * For edython.
 * @param {kvargs} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 */
eYo.Expr.shortliteral.prototype.validateComponents = function(kvargs) {
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
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {string} op op is the operator
 * @private
 */
eYo.Expr.shortliteral.prototype.makeTitle = function (variant) {
  return eYo.Do.createSPAN(variant + '…' + variant, 'eyo-code')
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.Expr.Literal.literalPopulateContextMenuFirst_ = function (mngr) {
  mngr.populateProperties(this, 'delimiter')
  mngr.separate()
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
      return mngr.newMenuItem(title, () => {
        this.prefix_p = prefix
      })
    }
  }
  if (!current.length) {
    // mngr.addInsertChild(item('u', insert))
    mngr.addInsertChild(item('r', 'r'))
    can_f && (mngr.addInsertChild(item('f', 'f')))
    can_b && (mngr.addInsertChild(item('b', 'b')))
  } else if (current === 'u') {
    mngr.addRemoveChild(item('u', ''))
  } else if (current === 'r') {
    mngr.addInsertChild(item('f', 'rf'))
    can_b && (mngr.addInsertChild(item('b', 'rb')))
    mngr.addRemoveChild(item('r', ''))
  } else if (current === 'f') {
    mngr.addInsertChild(item('r', 'rf'))
    mngr.addRemoveChild(item('f', ''))
  } else if (current === 'b') {
    mngr.addInsertChild(item('r', 'rb'))
    mngr.addRemoveChild(item('b', ''))
  } else if (['rf', 'fr'].indexOf(current.toLowerCase()) < 0) {
    mngr.addRemoveChild(item('r', 'b'))
    mngr.addRemoveChild(item('b', 'r'))
  } else {
    mngr.addRemoveChild(item('r', 'f'))
    mngr.addRemoveChild(item('f', 'r'))
  }
  mngr.shouldSeparateInsert()
  return true
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Expr.shortliteral.prototype.populateContextMenuFirst_ = function (mngr) {
  eYo.Expr.Literal.literalPopulateContextMenuFirst_.call(this, mngr)
  eYo.Expr.shortliteral.superProto_.populateContextMenuFirst_.call(this, mngr)
  return true
}

/**
 * Class for a Delegate, longliteral (expression).
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.Expr.shortliteral.makeSubclass('longliteral', {
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
      didChange (oldValue, newValue) /** @suppress {globalThis} */ {
        this.didChange(oldValue, newValue)
        var b3k = this.brick
        var F = (xre, type, formatted) => {
          var m = XRegExp.exec(newValue, xre)
          if (m) {
            b3k.prefix_p = m.prefix || ''
            b3k.delimiter_p = m.delimiter || "'''"
            b3k.content_p = m.content || ''
            b3k.subtype_p = m.formatted ? (formatted || type) : type
            return true
          }
          return false
        }
        if (F(eYo.XRE.longstringliteralSingle, eYo.T3.Expr.longstringliteral, eYo.T3.Expr.longformattedliteral) ||
        F(eYo.XRE.longstringliteralDouble, eYo.T3.Expr.longstringliteral, eYo.T3.Expr.longformattedliteral) ||
        F(eYo.XRE.longbytesliteralSingle, eYo.T3.Expr.longbytesliteral) ||
        F(eYo.XRE.longbytesliteralDouble, eYo.T3.Expr.longbytesliteral)) {
          this.brick.removeError(eYo.Key.VALUE)
        } else if (newValue && newValue.length) {
          this.brick.setError(eYo.Key.VALUE, 'Bad string|bytes literal: ' +
          (newValue.length > 11 ? newValue.substr(0, 10) + '…' : newValue))
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.T3.Expr.longformattedliteral) {
          this.doChange(`f''''''`)
        } else {
          this.doChange(`''''''`)
        }
      }
    }
  },
  out: {
    check: /** @suppress globalThis */ function () {
      return [this.brick.subtype_p]
    }
  }
})

/**
 * Validate the components.
 * For edython.
 * @param {kvargs} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 */
eYo.Expr.longliteral.prototype.validateComponents = function(kvargs) {
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
].forEach(k => {
  eYo.C9r.register(k, (eYo.Expr[k] = eYo.Expr.longliteral))
})

eYo.Expr.Literal.T3s = [
  eYo.T3.Expr.shortliteral,
  eYo.T3.Expr.longliteral,
  eYo.T3.Expr.numberliteral
]
