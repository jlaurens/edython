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


eYo.require('expr')

eYo.forwardDeclare('xre')
eYo.forwardDeclare('msg')

goog.forwardDeclare('goog.dom')

/**
 * @name{eYo.expr.literal}
 * @constructor
 * Class for a Delegate, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.expr.Dflt.makeSubclass('literal', {
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
eYo.expr.literal.prototype.SaveData = function (element, opt) {
  eYo.expr.literal.superProto_.SaveData.Apply(this, arguments)
  if (this.value_p == '') {
    element.setAttribute(eYo.key.PLACEHOLDER, this.value_d.model.placeholder)
  }
}

/**
 * Class for a Delegate, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.expr.literal.makeSubclass('numberliteral', {
  data: {
    type: {
      all: [
        eYo.t3.Expr.unset,
        eYo.t3.Expr.integer,
        eYo.t3.Expr.floatnumber,
        eYo.t3.Expr.imagnumber
      ],
      init: eYo.t3.Expr.integer,
      noUndo: true,
      xml: false
    },
    value: {
      init: '',
      main: true,
      placeholder: 0,
      validate (after) /** @suppress {globalThis} */ {
        var types = this.brick.type_d.getAll()
        var p5e = eYo.t3.profile.get(after, null)
        return types.indexOf(p5e.expr) >= 0 || p5e.raw === eYo.t3.Expr.unset ? after : eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var type = after
          ? eYo.t3.profile.get(after, null).expr
          : eYo.t3.Expr.integer
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
  eYo.C9r.register(k, (eYo.expr[k] = eYo.expr.numberliteral))
})

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {string} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 */
eYo.expr.numberliteral.prototype.getBaseType = function () {
  return this.type_p
}

/**
 * Class for a Delegate, string litteral.
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.expr.literal.makeSubclass('shortliteral', {
  data: {
    subtype: {
      all: [
        eYo.t3.Expr.Shortstringliteral,
        eYo.t3.Expr.Shortformattedliteral,
        eYo.t3.Expr.Shortbytesliteral
      ],
      init: eYo.t3.Expr.Shortstringliteral,
      synchronize: /** @this{eYo.data.Dflt} */ function (after) {
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
      didChange (builtin) /** @this{eYo.data.Dflt} */ {
        builtin()
        this.brick.value_d.consolidate()
      },
      synchronize (builtin) /** @this{eYo.data.Dflt} */ {
        builtin()
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
      didChange (builtin) /** @suppress {globalThis} */ { /** @this{eYo.data.Dflt} */
      builtin()
        this.brick.value_d.consolidate()
      },
      validate (after) { /** @this{eYo.data.Dflt} */
        return !goog.isDef(this.brick.content_p) || this.brick.validateComponents({
          prefix: after}
        ) ? after : eYo.INVALID
      },
      synchronize (builtin, after) { /** @this{eYo.data.Dflt} */ 
        this.incog = !after || !after.length
        builtin()
      },
      xml: false,
    },
    content: { // not saved
      placeholder () /** @suppress {globalThis} */ {
        var subtype = this.brick.subtype_p
        return subtype === eYo.t3.Expr.Shortbytesliteral || subtype === eYo.t3.Expr.longbytesliteral
          ? eYo.msg.placeholder.BYTES : eYo.msg.placeholder.STRING
      },
      didChange (builtin) /** @suppress {globalThis} */ {
        builtin()
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
      validate (after) { /** @this{eYo.data.Dflt} */
        return eYo.isStr(after)? after: eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {/** @this{eYo.data.Dflt} */ 
      builtin()
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
        if (F(eYo.xre.ShortstringliteralSingle, eYo.t3.Expr.shortstringliteral, eYo.t3.Expr.shortformattedliteral) ||
        F(eYo.xre.ShortstringliteralDouble, eYo.t3.Expr.shortstringliteral, eYo.t3.Expr.shortformattedliteral) ||
        F(eYo.xre.ShortbytesliteralSingle, eYo.t3.Expr.shortbytesliteral) ||
        F(eYo.xre.ShortbytesliteralDouble, eYo.t3.Expr.shortbytesliteral)) {
          this.brick.removeError(eYo.key.VALUE)
        } else if (after && after.length) {
          this.brick.setError(eYo.key.VALUE, 'Bad string|bytes literal: ' +
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
        if (type === eYo.t3.Expr.Shortformattedliteral) {
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
  eYo.C9r.register(k, (eYo.expr[k] = eYo.expr.Shortliteral))
})

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {string} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 */
eYo.expr.Shortliteral.prototype.getBaseType = function () {
  return this.subtype_p
}

/**
 * Validate the components.
 * For edython.
 * @param {kvargs} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 */
eYo.expr.Shortliteral.prototype.validateComponents = function(kvargs) {
  var prefix = kvargs.prefix || this.prefix_p
  var delimiter = kvargs.delimiter || this.delimiter_p
  var content = kvargs.content || this.content_p
  var value = `${prefix}${delimiter}${content}${delimiter}`
  return (!!XRegExp.exec(value, eYo.xre.ShortbytesliteralSingle) && eYo.t3.Expr.shortbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.ShortbytesliteralDouble) && eYo.t3.Expr.shortbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.ShortstringliteralSingle) && eYo.t3.Expr.shortstringliteral) ||
  (!!XRegExp.exec(value, eYo.xre.ShortstringliteralDouble) && eYo.t3.Expr.shortstringliteral)
}

/**
 * Get the content for the menu item.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {string} op op is the operator
 * @private
 */
eYo.expr.Shortliteral.prototype.makeTitle = function (variant) {
  return eYo.do.CreateSPAN(variant + '…' + variant, 'eyo-code')
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.expr.literal.literalPopulateContextMenuFirst_ = function (mngr) {
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
        eYo.do.CreateSPAN(msg, 'eyo-code'),
        goog.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
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
eYo.expr.Shortliteral.prototype.populateContextMenuFirst_ = function (mngr) {
  eYo.expr.literal.literalPopulateContextMenuFirst_.Call(this, mngr)
  eYo.expr.shortliteral.SuperProto_.populateContextMenuFirst_.Call(this, mngr)
  return true
}

/**
 * Class for a Delegate, longliteral (expression).
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.expr.Shortliteral.makeSubclass('longliteral', {
  data: {
    subtype: {
      all: [
        eYo.t3.Expr.longstringliteral,
        eYo.t3.Expr.longformattedliteral,
        eYo.t3.Expr.longbytesliteral
      ],
      init: eYo.t3.Expr.longstringliteral
    },
    delimiter: {
      all: ["'''", '"""'],
      init: '"""'
    },
    value: {
      init: "''''''",
      main: true,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        var F = (xre, type, formatted) => {
          var m = XRegExp.exec(after, xre)
          if (m) {
            b3k.prefix_p = m.prefix || ''
            b3k.delimiter_p = m.delimiter || "'''"
            b3k.content_p = m.content || ''
            b3k.subtype_p = m.formatted ? (formatted || type) : type
            return true
          }
          return false
        }
        if (F(eYo.xre.longstringliteralSingle, eYo.t3.Expr.longstringliteral, eYo.t3.Expr.longformattedliteral) ||
        F(eYo.xre.longstringliteralDouble, eYo.t3.Expr.longstringliteral, eYo.t3.Expr.longformattedliteral) ||
        F(eYo.xre.longbytesliteralSingle, eYo.t3.Expr.longbytesliteral) ||
        F(eYo.xre.longbytesliteralDouble, eYo.t3.Expr.longbytesliteral)) {
          this.brick.removeError(eYo.key.VALUE)
        } else if (after && after.length) {
          this.brick.setError(eYo.key.VALUE, 'Bad string|bytes literal: ' +
          (after.length > 11 ? after.substr(0, 10) + '…' : after))
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.Expr.longformattedliteral) {
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
eYo.expr.longliteral.prototype.validateComponents = function(kvargs) {
  var prefix = kvargs.prefix || this.prefix_p
  var delimiter = kvargs.delimiter || this.delimiter_p
  var content = kvargs.content || this.content_p
  var value = `${prefix}${delimiter}${content}${delimiter}`
  return (!!XRegExp.exec(value, eYo.xre.longbytesliteralSingle) && eYo.t3.Expr.longbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.longbytesliteralDouble) && eYo.t3.Expr.longbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.longstringliteralSingle) && eYo.t3.Expr.longstringliteral) ||
  (!!XRegExp.exec(value, eYo.xre.longstringliteralDouble) && eYo.t3.Expr.longstringliteral)
}

;[
  'longstringliteral',
  'longformattedliteral',
  'longbytesliteral',
].forEach(k => {
  eYo.C9r.register(k, (eYo.expr[k] = eYo.expr.longliteral))
})

eYo.expr.literal.T3s = [
  eYo.t3.Expr.Shortliteral,
  eYo.t3.Expr.longliteral,
  eYo.t3.Expr.numberliteral
]
