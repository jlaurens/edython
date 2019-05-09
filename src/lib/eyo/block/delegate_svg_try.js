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

goog.provide('eYo.DelegateSvg.Try')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Group')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, try_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('try_part', {
  fields: {
    prefix: 'try'
  }
}, true)

/**
 * Class for a DelegateSvg, except_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('except_part', {
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
        var O = this.owner
        O.expression_d.requiredIncog = newValue !== eYo.Key.NONE
        O.alias_d.requiredIncog = newValue === eYo.Key.ALIASED
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
          this.required = this.owner.variant_p !== eYo.Key.NONE
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        var O = this.owner
        if (this.isRequiredFromSaved() && O.variant_p !== eYo.Key.ALIASED) {
          O.variant_p = eYo.Key.EXPRESSION
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
          this.required = this.owner.variant_p === eYo.Key.ALIASED
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.ALIASED
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
      hole_value: 'expr',
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.owner.variant_p === eYo.Key.NONE && this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.EXPRESSION
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetC8n, targetOldC8n) {
        var O = this.b_eyo
        O.variant_p === eYo.Key.ALIASED || (O.variant_p = eYo.Key.EXPRESSION)
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
        return this.owner.variant_p !== eYo.Key.ALIASED
      },
      check: eYo.T3.Expr.identifier,
      hole_value: 'name',
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.ALIASED
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetC8n, targetOldC8n) {
        var O = this.b_eyo
        O.variant_p = eYo.Key.ALIASED
      }
    }
  },
  statement: {
    top: {
      check: /** @suppress {globalThis} */ function (type) {
        return type === eYo.T3.Stmt.except_part
        ? eYo.T3.Stmt.Previous.except_part
        : eYo.T3.Stmt.Previous.void_except_part
      }
    },
    bottom: {
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
  eYo.DelegateSvg.Stmt[k] = eYo.DelegateSvg.Stmt.except_part
  eYo.DelegateSvg.Manager.register(k)
})
/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.DelegateSvg.Stmt.except_part.prototype.getType = eYo.Decorate.onChangeCount(
  'getType',
  function () {
    var block = this.block_
    this.setupType(
      this.variant_p === eYo.Key.NONE
      ? eYo.T3.Stmt.void_except_part
      : eYo.T3.Stmt.except_part
    )
    return block.type
  }
)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.except_part.prototype.populateContextMenuFirst_ = function (mgr) {
  var current = this.variant_p
  var F = (content, k) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = k
    })
    mgr.addChild(menuItem, true)
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
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.except_part.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a DelegateSvg, finally_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('finally_part', {
  fields: {
    prefix: 'finally'
  }
}, true)

/**
 * Class for a DelegateSvg, raise_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('raise_stmt', {
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
        var O = this.owner
        O.expression_d.requiredIncog = newValue !== eYo.Key.NONE
        O.from_d.requiredIncog = newValue === eYo.Key.FROM
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
          this.required = this.owner.variant_p !== eYo.Key.NONE
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.EXPRESSION
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
          this.required = this.owner.variant_p === eYo.Key.FROM
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.FROM
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
      hole_value: eYo.Msg.Placeholder.EXPRESSION,
      xml: {
        load: /** @suppress {globalThis} */ function (element, opt) {
          this.load(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved() && this.owner.variant_p === eYo.Key.NONE) {
          this.owner.variant_p = eYo.Key.EXPRESSION
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
      hole_value: eYo.Msg.Placeholder.EXPRESSION,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.FROM
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.raise_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var current = this.variant_p
  var F = (content, k) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = k
    })
    mgr.addChild(menuItem, true)
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
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.raise_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a DelegateSvg, assert_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('assert_stmt', {
  data: {
    variant: {
      all: [
        eYo.Key.UNARY,
        eYo.Key.BINARY
      ],
      init: eYo.Key.UNARY,
      synchronize: /** @suppress {globalThis} */ function (newValue){
        this.synchronize(newValue)
        this.owner.expression2_d.setIncog(newValue !== eYo.Key.BINARY)
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
          this.required = this.owner.variant_p === eYo.Key.BINARY
          this.save(element, opt)
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.BINARY
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
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expr'
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
      hole_value: eYo.Msg.Placeholder.EXPRESSION,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.BINARY
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.assert_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var current = this.variant_p
  var F = (content, key) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mgr.addChild(menuItem, true)
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
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.assert_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

eYo.DelegateSvg.Try.T3s = [
  eYo.T3.Stmt.try_part,
  eYo.T3.Stmt.except_part,
  eYo.T3.Stmt.void_except_part,
  eYo.T3.Stmt.finally_part,
  eYo.T3.Stmt.raise_stmt,
  eYo.T3.Stmt.assert_stmt
]
