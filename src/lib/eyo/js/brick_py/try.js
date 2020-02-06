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

eYo.require('stmt.Group')

eYo.require('o3d.Change')

eYo.provide('brick.try')

eYo.forwardDeclare('msg')

goog.forwardDeclare('goog.dom')

/**
 * Class for a Delegate, try_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.Group.makeInheritedC9r('try_part', {
  fields: {
    prefix: 'try'
  }
}, true)

/**
 * Class for a Delegate, except_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.Group.makeInheritedC9r('except_part', {
  data: {
    variant: {
      all: [
        eYo.key.NONE,
        eYo.key.EXPRESSION,
        eYo.key.ALIASED
      ],
      init: eYo.key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.expression_d.requiredIncog = after !== eYo.key.NONE
        b3k.alias_d.requiredIncog = after === eYo.key.ALIASED
      },
      xml: false
    },
    expression: {
      order: 200,
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.Variant_p !== eYo.key.NONE
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (this.requiredFromSaved && b3k.Variant_p !== eYo.key.ALIASED) {
          b3k.Variant_p = eYo.key.EXPRESSION
        }
      }
    },
    alias: {
      order: 400,
      init: '',
      placeholder: eYo.msg.placeholder.ALIAS,
      synchronize: true,
      validate (after) /** @suppress {globalThis} */ {
        var type = eYo.t3.profile.get(after).expr
        return type === eYo.t3.expr.unset
        || type === eYo.t3.expr.identifier
        || type === eYo.t3.expr.builtin__name
        ? after
        : eYo.INVALID
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.Variant_p === eYo.key.ALIASED
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.ALIASED
        }
      }
    }
  },
  fields: {
    prefix: 'except'
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.brick.Variant_p === eYo.key.NONE && this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.EXPRESSION
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetM4t, targetOldM4t) {
        var O = this.brick
        b3k.Variant_p === eYo.key.ALIASED || (b3k.Variant_p = eYo.key.EXPRESSION)
      }
    },
    alias: {
      order: 3000,
      fields: {
        prefix: 'as',
        bind: {
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      validateIncog () /** @suppress {globalThis} */ {
        return this.brick.Variant_p !== eYo.key.ALIASED
      },
      check: eYo.t3.expr.identifier,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.ALIASED
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetM4t, targetOldM4t) {
        var O = this.brick
        b3k.Variant_p = eYo.key.ALIASED
      }
    }
  },
  head: {
    check (type) /** @suppress {globalThis} */ {
      return type === eYo.t3.stmt.except_part
      ? eYo.t3.stmt.previous.except_part
      : eYo.t3.stmt.previous.void_except_part
    }
  },
  foot: {
    check (type) /** @suppress {globalThis} */ {
      return type === eYo.t3.stmt.except_part
      ? eYo.t3.stmt.next.except_part
      : eYo.t3.stmt.next.void_except_part
    }
  }
}, true)

;[
  'void_except_part'
].forEach(k => {
  eYo.c9r.register(k, (eYo.stmt[k] = eYo.stmt.except_part))
})
/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.stmt.except_part.prototype.getType = eYo.c9r.decorateChange(
  'getType',
  function () {
    this.setupType(
      this.Variant_p === eYo.key.NONE
      ? eYo.t3.stmt.void_except_part
      : eYo.t3.stmt.except_part
    )
    return this.type
  }
)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.except_part.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.Variant_p
  var F = (content, k) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.Variant_p = k
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('except:')
  ), eYo.key.NONE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('except ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…:')
  ), eYo.key.EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('except', 'eyo-code-reserved'),
    goog.dom.createTextNode(' … '),
    eYo.do.CreateSPAN(' as', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …:')
  ), eYo.key.ALIASED
  )
  mngr.shouldSeparate()
  return eYo.stmt.except_part.SuperProto_.populateContextMenuFirst_.call(this, mngr)
}

/**
 * Class for a Delegate, finally_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.Group.makeInheritedC9r('finally_part', {
  fields: {
    prefix: 'finally'
  }
}, true)

/**
 * Class for a Delegate, raise_stmt.
 * For edython.
 */
eYo.stmt.makeC9r('raise_stmt', {
  data: {
    variant: {
      all: [
        eYo.key.NONE,
        eYo.key.EXPRESSION,
        eYo.key.FROM
      ],
      init: eYo.key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.expression_d.requiredIncog = after !== eYo.key.NONE
        b3k.from_d.requiredIncog = after === eYo.key.FROM
      },
      xml: false
    },
    expression: {
      order: 200,
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.Variant_p !== eYo.key.NONE
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.EXPRESSION
        }
      }
    },
    from: {
      order: 400,
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.Variant_p === eYo.key.FROM
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.FROM
        }
      }
    }
  },
  fields: {
    prefix: 'raise'
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      xml: {
        load (element, opt) /** @suppress {globalThis} */ {
          this.load(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved && this.brick.Variant_p === eYo.key.NONE) {
          this.brick.Variant_p = eYo.key.EXPRESSION
        }
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.FROM
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.raise_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.Variant_p
  var F = (content, k) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.Variant_p = k
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('raise')
  ), eYo.key.NONE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('raise ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.key.EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('raise', 'eyo-code-reserved'),
    goog.dom.createTextNode(' … '),
    eYo.do.CreateSPAN(' from', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …')
  ), eYo.key.FROM
  )
  mngr.shouldSeparate()
  return eYo.stmt.raise_stmt.SuperProto_.populateContextMenuFirst_.call(this, mngr)
}

/**
 * Class for a Delegate, assert_stmt.
 * For edython.
 */
eYo.stmt.makeC9r('assert_stmt', {
  data: {
    variant: {
      all: [
        eYo.key.UNARY,
        eYo.key.BINARY
      ],
      init: eYo.key.UNARY,
      synchronize (builtin, after) /** @suppress {globalThis} */{
        builtin()
        this.brick.expression2_d.incog = after !== eYo.key.BINARY
      }
    },
    expression: {
      init: '',
      synchronize: true
    },
    expression2: {
      init: '',
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.Variant_p === eYo.key.BINARY
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.BINARY
        }
      }
    }
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        prefix: 'assert',
        bind: {
          endEditing: true,
          placeholder: eYo.msg.placeholder.EXPRESSION
        }
      },
      check: eYo.t3.expr.check.expression
    },
    expression2: {
      order: 2,
      fields: {
        label: ',',
        bind: {
          endEditing: true,
          placeholder: eYo.msg.placeholder.EXPRESSION
        }
      },
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.BINARY
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.Assert_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.Variant_p
  var F = (content, key) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.Variant_p = key
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('assert ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.key.UNARY
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('assert ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…, …')
  ), eYo.key.BINARY
  )
  mngr.shouldSeparate()
  return eYo.stmt.Assert_stmt.SuperProto_.populateContextMenuFirst_.call(this, mngr)
}

eYo.brick.try.t3s = [
  eYo.t3.stmt.try_part,
  eYo.t3.stmt.except_part,
  eYo.t3.stmt.void_except_part,
  eYo.t3.stmt.finally_part,
  eYo.t3.stmt.raise_stmt,
  eYo.t3.stmt.assert_stmt
]
