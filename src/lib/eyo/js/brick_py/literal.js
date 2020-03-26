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

//g@@g.forwardDeclare('g@@g.dom')

/**
 * @name{eYo.expr.literal}
 * @constructor
 * Class for a Delegate, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.expr.makeC9r('literal', {
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
eYo.expr.literal.prototype.saveData = function (element, opt) {
  eYo.expr.literal.eyo.C9r_s.saveData.apply(this, arguments)
  if (this.Value_p == '') {
    element.setAttribute(eYo.key.PLACEHOLDER, this.value_d.model.placeholder)
  }
}

/**
 * Class for a Delegate, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.expr.literal.makeInheritedC9r('numberliteral', {
  data: {
    type: {
      all: [
        eYo.t3.expr.unset,
        eYo.t3.expr.integer,
        eYo.t3.expr.floatnumber,
        eYo.t3.expr.imagnumber
      ],
      init: eYo.t3.expr.integer,
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
        return types.indexOf(p5e.expr) >= 0 || p5e.raw === eYo.t3.expr.unset ? after : eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var type = after
          ? eYo.t3.profile.get(after, null).expr
          : eYo.t3.expr.integer
        this.brick.Type_p = type
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
  eYo.c9r.register(k, (eYo.expr[k] = eYo.expr.numberliteral))
})

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {string} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 */
eYo.expr.numberliteral.prototype.getBaseType = function () {
  return this.Type_p
}

/**
 * Class for a Delegate, string litteral.
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.expr.literal.makeInheritedC9r('shortliteral', {
  data: {
    subtype: {
      all: [
        eYo.t3.expr.shortstringliteral,
        eYo.t3.expr.shortformattedliteral,
        eYo.t3.expr.shortbytesliteral
      ],
      init: eYo.t3.expr.shortstringliteral,
      synchronize: /** @this{eYo.data.Base} */ function (after) {
        // synchronize the placeholder text
        var p = this.Content_p
        if (!p || !p.length) {
          this.brick.content_d.field.getPlaceholderText(true)
        }
      },
      xml: false
    },
    delimiter: {
      all: ["'", '"'],
      init: '"',
      didChange (builtin) /** @this{eYo.data.Base} */ {
        builtin()
        this.brick.value_d.consolidate()
      },
      synchronize (builtin) /** @this{eYo.data.Base} */ {
        builtin()
        var f4s = this.brick.fieldByKey
        f4s.start.text = f4s.end.text = this.toText()
      },
      xml: false,
    },
    prefix: {
      all: ['', 'r', 'u', 'R', 'U', 'f', 'F',
        'fr', 'Fr', 'fR', 'FR', 'rf', 'rF', 'Rf', 'RF',
        'b', 'B', 'br', 'Br', 'bR', 'BR', 'rb', 'rB', 'Rb', 'RB'],
      init: '',
      didChange (builtin) /** @suppress {globalThis} */ { /** @this{eYo.data.Base} */
      builtin()
        this.brick.value_d.consolidate()
      },
      validate (after) { /** @this{eYo.data.Base} */
        return !eYo.isDef(this.brick.Content_p) || this.brick.validateComponents({
          prefix: after}
        ) ? after : eYo.INVALID
      },
      synchronize (builtin, after) { /** @this{eYo.data.Base} */ 
        this.incog = !after || !after.length
        builtin()
      },
      xml: false,
    },
    content: { // not saved
      placeholder () /** @suppress {globalThis} */ {
        var subtype = this.brick.Subtype_p
        return subtype === eYo.t3.expr.shortbytesliteral || subtype === eYo.t3.expr.longbytesliteral
          ? eYo.msg.placeholder.BYTES : eYo.msg.placeholder.STRING
      },
      didChange (builtin) /** @suppress {globalThis} */ {
        builtin()
        this.brick.value_d.consolidate()
      },
      validate (after) /** @suppress {globalThis} */ {
        return !eYo.isDef(this.brick.Content_p) || this.brick.validateComponents({
          content: after
        }) ? after : eYo.INVALID
      },
      synchronize: true
    },
    value: {
      init: "''",
      main: true,
      validate (after) { /** @this{eYo.data.Base} */
        return eYo.isStr(after)? after: eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {/** @this{eYo.data.Base} */ 
      builtin()
        var b3k = this.brick
        var F = (xre, type, formatted) => {
          var m = XRegExp.exec(after, xre)
          if (m) {
            b3k.Prefix_p = m.prefix || ''
            b3k.Delimiter_p = m.delimiter || "'"
            b3k.Content_p = m.content || ''
            b3k.Subtype_p = m.formatted ? (formatted || type) : type
            return true
          }
          return false
        }
        if (F(eYo.xre.ShortstringliteralSingle, eYo.t3.expr.shortstringliteral, eYo.t3.expr.shortformattedliteral) ||
        F(eYo.xre.ShortstringliteralDouble, eYo.t3.expr.shortstringliteral, eYo.t3.expr.shortformattedliteral) ||
        F(eYo.xre.ShortbytesliteralSingle, eYo.t3.expr.shortbytesliteral) ||
        F(eYo.xre.ShortbytesliteralDouble, eYo.t3.expr.shortbytesliteral)) {
          this.brick.removeError(eYo.key.VALUE)
        } else if (after && after.length) {
          this.brick.setError(eYo.key.VALUE, 'Bad string|bytes literal: ' +
          (after.length > 11 ? after.substr(0, 10) + '…' : after))
        }
      },
      consolidate () /** @suppress {globalThis} */ {
        var prefix = this.brick.Prefix_p
        var delimiter = this.brick.Delimiter_p
        var content = this.brick.Content_p
        if (eYo.isDef(prefix) && eYo.isDef(delimiter) && eYo.isDef(content)) {
          this.set('' + prefix + delimiter + content + delimiter)
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.expr.shortformattedliteral) {
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
      return [this.brick.Subtype_p]
    }
  }
})

;[
  'shortstringliteral',
  'shortformattedliteral',
  'shortbytesliteral',
].forEach(k => {
  eYo.c9r.register(k, (eYo.expr[k] = eYo.expr.shortliteral))
})

/**
 * The type and connection depend on the properties prefix, value and variant.
 * For edython.
 * @param {string} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 */
eYo.expr.shortliteral.prototype.getBaseType = function () {
  return this.Subtype_p
}

/**
 * Validate the components.
 * For edython.
 * @param {kvargs} [prototypeName] Name of the language object containing
 *     type-specific functions for this brick.
 * @constructor
 */
eYo.expr.shortliteral.prototype.validateComponents = function(kvargs) {
  var prefix = kvargs.prefix || this.Prefix_p
  var delimiter = kvargs.delimiter || this.Delimiter_p
  var content = kvargs.content || this.Content_p
  var value = `${prefix}${delimiter}${content}${delimiter}`
  return (!!XRegExp.exec(value, eYo.xre.ShortbytesliteralSingle) && eYo.t3.expr.shortbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.ShortbytesliteralDouble) && eYo.t3.expr.shortbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.ShortstringliteralSingle) && eYo.t3.expr.shortstringliteral) ||
  (!!XRegExp.exec(value, eYo.xre.ShortstringliteralDouble) && eYo.t3.expr.shortstringliteral)
}

/**
 * Get the content for the menu item.
 * @param {eYo.brick.Base} brick The brick.
 * @param {string} op op is the operator
 * @private
 */
eYo.expr.shortliteral.prototype.makeTitle = function (variant) {
  return eYo.do.CreateSPAN(variant + '…' + variant, 'eyo-code')
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
console.warn('NYI')
eYo.expr.literal.literalPopulateContextMenuFirst_ = function (mngr) {
  mngr.populateProperties(this, 'delimiter')
  mngr.separate()
  var current = this.Prefix_p
  var can_b = this.validateComponents({
    prefix: 'b'
  })
  var can_f = this.validateComponents({
    prefix: 'f'
  })
  var item = (msg, prefix) => {
    if (prefix !== current) {
      var title = eYo.dom.createDom(eYo.dom.TagName.SPAN, null,
        eYo.do.CreateSPAN(msg, 'eyo-code'),
        eYo.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
      )
      return mngr.newMenuItem(title, () => {
        this.Prefix_p = prefix
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
 * @param {eYo.brick.Base} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.expr.shortliteral.prototype.populateContextMenuFirst_ = function (mngr) {
  eYo.expr.literal.literalPopulateContextMenuFirst_.call(this, mngr)
  eYo.expr.shortliteral.eyo.C9r_s.populateContextMenuFirst_.call(this, mngr)
  return true
}

/**
 * Class for a Delegate, longliteral (expression).
 * The subtype is the kind of delimiters used.
 * For edython.
 */
eYo.expr.shortliteral.makeInheritedC9r('longliteral', {
  data: {
    subtype: {
      all: [
        eYo.t3.expr.longstringliteral,
        eYo.t3.expr.longformattedliteral,
        eYo.t3.expr.longbytesliteral
      ],
      init: eYo.t3.expr.longstringliteral
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
            b3k.Prefix_p = m.prefix || ''
            b3k.Delimiter_p = m.delimiter || "'''"
            b3k.Content_p = m.content || ''
            b3k.Subtype_p = m.formatted ? (formatted || type) : type
            return true
          }
          return false
        }
        if (F(eYo.xre.longstringliteralSingle, eYo.t3.expr.longstringliteral, eYo.t3.expr.longformattedliteral) ||
        F(eYo.xre.longstringliteralDouble, eYo.t3.expr.longstringliteral, eYo.t3.expr.longformattedliteral) ||
        F(eYo.xre.longbytesliteralSingle, eYo.t3.expr.longbytesliteral) ||
        F(eYo.xre.longbytesliteralDouble, eYo.t3.expr.longbytesliteral)) {
          this.brick.removeError(eYo.key.VALUE)
        } else if (after && after.length) {
          this.brick.setError(eYo.key.VALUE, 'Bad string|bytes literal: ' +
          (after.length > 11 ? after.substr(0, 10) + '…' : after))
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.expr.longformattedliteral) {
          this.doChange(`f''''''`)
        } else {
          this.doChange(`''''''`)
        }
      }
    }
  },
  out: {
    check: /** @suppress globalThis */ function () {
      return [this.brick.Subtype_p]
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
  var prefix = kvargs.prefix || this.Prefix_p
  var delimiter = kvargs.delimiter || this.Delimiter_p
  var content = kvargs.content || this.Content_p
  var value = `${prefix}${delimiter}${content}${delimiter}`
  return (!!XRegExp.exec(value, eYo.xre.longbytesliteralSingle) && eYo.t3.expr.longbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.longbytesliteralDouble) && eYo.t3.expr.longbytesliteral) ||
  (!!XRegExp.exec(value, eYo.xre.longstringliteralSingle) && eYo.t3.expr.longstringliteral) ||
  (!!XRegExp.exec(value, eYo.xre.longstringliteralDouble) && eYo.t3.expr.longstringliteral)
}

;[
  'longstringliteral',
  'longformattedliteral',
  'longbytesliteral',
].forEach(k => {
  eYo.c9r.register(k, (eYo.expr[k] = eYo.expr.longliteral))
})
