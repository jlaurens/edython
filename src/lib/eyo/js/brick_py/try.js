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

eYo.require('eYo.Brick.Group')

eYo.require('eYo.Change')

eYo.provide('eYo.Brick.Try')

eYo.forwardDeclare('eYo.Msg')

goog.forwardDeclare('goog.dom')

/**
 * Class for a Delegate, try_part brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('try_part', {
  fields: {
    prefix: 'try'
  }
}, true)

/**
 * Class for a Delegate, except_part brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('except_part', {
  data: {
    variant: {
      all: [
        eYo.Key.NONE,
        eYo.Key.EXPRESSION,
        eYo.Key.ALIASED
      ],
      init: eYo.Key.NONE,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var b3k = this.brick
        b3k.expression_d.requiredIncog = newValue !== eYo.Key.NONE
        b3k.alias_d.requiredIncog = newValue === eYo.Key.ALIASED
      },
      xml: false
    },
    expression: {
      order: 200,
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.brick.variant_p !== eYo.Key.NONE
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        var b3k = this.brick
        if (this.requiredFromSaved && b3k.variant_p !== eYo.Key.ALIASED) {
          b3k.variant_p = eYo.Key.EXPRESSION
        }
      }
    },
    alias: {
      order: 400,
      init: '',
      placeholder: eYo.Msg.Placeholder.ALIAS,
      synchronize: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.T3.Profile.get(newValue).expr
        return type === eYo.T3.Expr.unset
        || type === eYo.T3.Expr.identifier
        || type === eYo.T3.Expr.builtin__name
        ? {validated: newValue}
        : null
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.brick.variant_p === eYo.Key.ALIASED
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.ALIASED
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
      check: eYo.T3.Expr.Check.expression,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.brick.variant_p === eYo.Key.NONE && this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.EXPRESSION
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetM4t, targetOldM4t) {
        var O = this.brick
        b3k.variant_p === eYo.Key.ALIASED || (b3k.variant_p = eYo.Key.EXPRESSION)
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
      validateIncog: /** @suppress {globalThis} */ function (newValue) {
        return this.brick.variant_p !== eYo.Key.ALIASED
      },
      check: eYo.T3.Expr.identifier,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.ALIASED
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetM4t, targetOldM4t) {
        var O = this.brick
        b3k.variant_p = eYo.Key.ALIASED
      }
    }
  },
  statement: {
    head: {
      check: /** @suppress {globalThis} */ function (type) {
        return type === eYo.T3.Stmt.except_part
        ? eYo.T3.Stmt.Previous.except_part
        : eYo.T3.Stmt.Previous.void_except_part
      }
    },
    foot: {
      check: /** @suppress {globalThis} */ function (type) {
        return type === eYo.T3.Stmt.except_part
        ? eYo.T3.Stmt.Next.except_part
        : eYo.T3.Stmt.Next.void_except_part
      }
    }
  }
}, true)

;[
  'void_except_part'
].forEach(k => {
  eYo.Stmt[k] = eYo.Stmt.except_part
  eYo.Brick.mngr.register(k)
})
/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.Stmt.except_part.prototype.getType = eYo.Change.decorate(
  'getType',
  function () {
    this.setupType(
      this.variant_p === eYo.Key.NONE
      ? eYo.T3.Stmt.void_except_part
      : eYo.T3.Stmt.except_part
    )
    return this.type
  }
)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.except_part.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.variant_p
  var F = (content, k) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.variant_p = k
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('except:')
  ), eYo.Key.NONE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('except ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…:')
  ), eYo.Key.EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('except', 'eyo-code-reserved'),
    goog.dom.createTextNode(' … '),
    eYo.Do.createSPAN(' as', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …:')
  ), eYo.Key.ALIASED
  )
  mngr.shouldSeparate()
  return eYo.Stmt.except_part.superClass_.populateContextMenuFirst_.call(this, mngr)
}

/**
 * Class for a Delegate, finally_part brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('finally_part', {
  fields: {
    prefix: 'finally'
  }
}, true)

/**
 * Class for a Delegate, raise_stmt.
 * For edython.
 */
eYo.Stmt.makeSubclass('raise_stmt', {
  data: {
    variant: {
      all: [
        eYo.Key.NONE,
        eYo.Key.EXPRESSION,
        eYo.Key.FROM
      ],
      init: eYo.Key.NONE,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var b3k = this.brick
        b3k.expression_d.requiredIncog = newValue !== eYo.Key.NONE
        b3k.from_d.requiredIncog = newValue === eYo.Key.FROM
      },
      xml: false
    },
    expression: {
      order: 200,
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.brick.variant_p !== eYo.Key.NONE
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.EXPRESSION
        }
      }
    },
    from: {
      order: 400,
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.brick.variant_p === eYo.Key.FROM
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.FROM
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
      check: eYo.T3.Expr.Check.expression,
      xml: {
        load: /** @suppress {globalThis} */ function (element, opt) {
          this.load(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved && this.brick.variant_p === eYo.Key.NONE) {
          this.brick.variant_p = eYo.Key.EXPRESSION
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
      check: eYo.T3.Expr.Check.expression,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.FROM
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.raise_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.variant_p
  var F = (content, k) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.variant_p = k
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('raise')
  ), eYo.Key.NONE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('raise ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.Key.EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('raise', 'eyo-code-reserved'),
    goog.dom.createTextNode(' … '),
    eYo.Do.createSPAN(' from', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …')
  ), eYo.Key.FROM
  )
  mngr.shouldSeparate()
  return eYo.Stmt.raise_stmt.superClass_.populateContextMenuFirst_.call(this, mngr)
}

/**
 * Class for a Delegate, assert_stmt.
 * For edython.
 */
eYo.Stmt.makeSubclass('assert_stmt', {
  data: {
    variant: {
      all: [
        eYo.Key.UNARY,
        eYo.Key.BINARY
      ],
      init: eYo.Key.UNARY,
      synchronize: /** @suppress {globalThis} */ function (newValue){
        this.synchronize(newValue)
        this.brick.expression2_d.incog = newValue !== eYo.Key.BINARY
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
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.brick.variant_p === eYo.Key.BINARY
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.BINARY
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
          placeholder: eYo.Msg.Placeholder.EXPRESSION
        }
      },
      check: eYo.T3.Expr.Check.expression
    },
    expression2: {
      order: 2,
      fields: {
        label: ',',
        bind: {
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.EXPRESSION
        }
      },
      check: eYo.T3.Expr.Check.expression,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.BINARY
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.assert_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.variant_p
  var F = (content, key) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('assert ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), eYo.Key.UNARY
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('assert ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…, …')
  ), eYo.Key.BINARY
  )
  mngr.shouldSeparate()
  return eYo.Stmt.assert_stmt.superClass_.populateContextMenuFirst_.call(this, mngr)
}

eYo.Brick.Try.T3s = [
  eYo.T3.Stmt.try_part,
  eYo.T3.Stmt.except_part,
  eYo.T3.Stmt.void_except_part,
  eYo.T3.Stmt.finally_part,
  eYo.T3.Stmt.raise_stmt,
  eYo.T3.Stmt.assert_stmt
]
