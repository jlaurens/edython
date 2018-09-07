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
})

/**
 * Class for a DelegateSvg, except_part block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Group.makeSubclass('except_part', {
  data: {
    variant: {
      EXCEPT: eYo.Key.EXCEPT,
      EXCEPT_EXPRESSION: eYo.Key.EXCEPT_EXPRESSION,
      EXCEPT_AS: eYo.Key.EXCEPT_AS,// deprecated because of the NAME_ALIAS
      all: [
        eYo.Key.EXCEPT,
        eYo.Key.EXCEPT_EXPRESSION,
        eYo.Key.EXCEPT_AS
      ],
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.consolidateType()
        this.owner.consolidateSubtype()
        this.owner.consolidateConnections()
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.slots.expression
        slot.required = (newValue !== this.EXCEPT)
        slot.setIncog()
        slot = this.owner.slots.as
        slot.required = (newValue === this.EXCEPT_AS)
        slot.setIncog()
      }
    }
  },
  fields: {
    prefix: 'except'
  },
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          if (variant.get() === variant.model.EXCEPT) {
            variant.set(variant.model.EXCEPT_EXPRESSION)
          }
        }
      }
    },
    as: {
      order: 2,
      fields: {
        label: 'as'
      },
      check: eYo.T3.Expr.identifier,
      hole_value: 'name',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.EXCEPT_AS)
        }
      }
    }
  }
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 * @param {!Blockly.Block} block
 * @param {?String} type
 */
eYo.DelegateSvg.Stmt.except_part.prototype.consolidateType = function (type) {
  var variant = this.data.variant.get()
  eYo.DelegateSvg.Stmt.except_part.superClass_.consolidateType.call(this, type || (variant > 0 ? eYo.T3.Stmt.except_part : eYo.T3.Stmt.void_except_part))
}


/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 * @param {!Blockly.Block} block
 */
eYo.DelegateSvg.Stmt.except_part.prototype.consolidateConnections = function () {
  eYo.DelegateSvg.Stmt.except_part.superClass_.consolidateConnections.call(this)
  var block = this.block_
  var f = function (k) {
    if (block.type === eYo.T3.Stmt[k]) {
      block.nextConnection.setCheck(eYo.T3.Stmt.Next[k])
      block.previousConnection.setCheck(eYo.T3.Stmt.Previous[k])
      return true
    }
  }
  f('except_part') || f('void_except_part')
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.except_part.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var M = this.data.variant.model
  var current = block.eyo.data.variant.get()
  var F = function (content, k) {
    var menuItem = mgr.newMenuItem(content, function () {
      block.eyo.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('except:')
  ), M.EXCEPT
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('except ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…:')
  ), M.EXCEPT_EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('except', 'eyo-code-reserved'),
    goog.dom.createTextNode(' … '),
    eYo.Do.createSPAN(' as', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …:')
  ), M.EXCEPT_AS
  )
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.except_part.superClass_.populateContextMenuFirst_.call(this, block, mgr)
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
})

/**
 * Class for a DelegateSvg, raise_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('raise_stmt', {
  data: {
    variant: {
      RAISE: eYo.Key.RAISE,
      RAISE_EXPRESSION: eYo.Key.RAISE_EXPRESSION,
      RAISE_FROM: eYo.Key.RAISE_FROM,
      all: [
        eYo.Key.RAISE,
        eYo.Key.RAISE_EXPRESSION,
        eYo.Key.RAISE_FROM
      ],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.slots.expression
        slot.required = (newValue === this.RAISE_EXPRESSION)
        slot.setIncog()
        slot = this.owner.slots.from
        slot.required = (newValue === this.RAISE_FROM)
        slot.setIncog()
      }
    }
  },
  fields: {
    prefix: 'raise'
  },
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          if (variant.get() === variant.RAISE) {
            variant.set(variant.RAISE_EXPRESSION)
          }
        }
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from'
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.RAISE_FROM)
        }
      }
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.raise_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var M = this.data.variant.model
  var current = this.data.variant.get()
  var F = function (content, k) {
    var menuItem = mgr.newMenuItem(content, function () {
      block.eyo.data.variant.set(k)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(k !== current)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code-reserved',
    goog.dom.createTextNode('raise')
  ), M.RAISE
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('raise ', 'eyo-code-reserved'),
    goog.dom.createTextNode('…')
  ), M.RAISE_EXPRESSION
  )
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('raise', 'eyo-code-reserved'),
    goog.dom.createTextNode(' … '),
    eYo.Do.createSPAN(' from', 'eyo-code-reserved'),
    goog.dom.createTextNode(' …')
  ), M.RAISE_FROM
  )
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.raise_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, assert_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('assert_stmt', {
  data: {
    variant: {
      UNARY: eYo.Key.UNARY,
      BINARY: eYo.Key.BINARY,
      all: [
        eYo.Key.UNARY,
        eYo.Key.BINARY
      ],
      synchronize: /** @suppress {globalThis} */ function (newValue){
        this.synchronize(newValue)
        var slot = this.owner.slots.expression
        slot.required = newValue === eYo.Key.BINARY
        slot.setIncog()
      }
    }
  },
  fields: {
    prefix: 'assert'
  },
  slots: {
    assert: {
      order: 1,
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression'
    },
    expression: {
      order: 2,
      fields: {
        label: ','
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(eYo.Key.BINARY)
        }
      }
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.assert_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = block.eyo.data.variant.get()
  var F = function (content, key) {
    var menuItem = mgr.newMenuItem(content, function () {
      block.eyo.data.variant.set(key)
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
  return eYo.DelegateSvg.Stmt.assert_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

eYo.DelegateSvg.Try.T3s = [
  eYo.T3.Stmt.try_part,
  eYo.T3.Stmt.except_part,
  eYo.T3.Stmt.finally_part,
  eYo.T3.Stmt.raise_stmt,
  eYo.T3.Stmt.assert_stmt
]
