/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython, primary blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Primary')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Expr')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('attributeref', {
  data: {
    attribute: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin_name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
      },
      synchronize: true
    }
  },
  slots: {
    primary: {
      order: 1,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary'
    },
    attribute: {
      order: 2,
      fields: {
        label: '.',
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.ATTRIBUTE,
          variable: true
        }
      }
    }
  }
})

/**
 * Class for a DelegateSvg, subscription and slicing.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('slicing', {
  data: {
    variant: { // data named 'variant' have `xml = false`, by default
      all: [0, 1],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.owner_.slots.name.setIncog(!!newValue)
        this.owner_.slots.primary.setIncog(!newValue)
      }
    },
    name: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
      },
      synchronize: true
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER,
          variable: true
        }
      }
    },
    primary: {
      order: 2,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary'
    },
    slice: {
      order: 3,
      fields: {
        start: '[',
        end: ']'
      },
      wrap: eYo.T3.Expr.slice_list
    }
  },
  output: {
    check: [eYo.T3.Expr.subscription, eYo.T3.Expr.slicing]
  }
})

eYo.DelegateSvg.Expr.subscription = eYo.DelegateSvg.Expr.slicing
eYo.DelegateSvg.Manager.register('subscription')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.slicing.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var current = this.data.variant.get() ? 1 : 0
  var F = function (content, j) {
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.data.variant.set(j)
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(j !== current)
  }
  var name = this.data.name.get()
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name ? 'eyo-code' : 'eyo-code-placeholder'),
    eYo.Do.createSPAN('[…]', 'eyo-code')
  )
  F(content, 0)
  content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
    eYo.Do.createSPAN('[…]', 'eyo-code')
  )
  F(content, 1)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Expr.slicing.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, base call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('base_call_expr', {
  data: {
    ary: {
      N_ARY: 'N',
      NO_ARY: '0',
      UNARY: '1',
      BINARY: '2',
      TERNARY: '3',
      all: ['0', '1', '2', '3', 'N'], // default value is Infinity
      init: 'N',
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var M = this.model
        this.owner_.slots.no_ary.setIncog(newValue !== M.NO_ARY)
        this.owner_.slots.unary.setIncog(newValue !== M.UNARY)
        this.owner_.slots.binary.setIncog(newValue !== M.BINARY)
        this.owner_.slots.ternary.setIncog(newValue !== M.TERNARY)
        this.owner_.slots.n_ary.setIncog(newValue !== M.N_ARY)
      }
    },
    name: {
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin_name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    }
  },
  fields: {
    name: {
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER
    }
  },
  slots: {
    n_ary: {
      order: 2,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list
    },
    no_ary: {
      order: 3,
      fields: {
        start: '(',
        end: ')'
      }
    },
    unary: {
      order: 4,
      fields: {
        start: '(',
        end: ')'
      },
      check: eYo.T3.Expr.Check.argument_any,
      optional: true
    },
    binary: {
      order: 5,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_2
    },
    ternary: {
      order: 6,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_3
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.base_call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var M = this.data.ary.model
  var current_ary = this.data.ary.get()
  var name = this.data.name.get() || 'foo'
  var F = function (ary, args) {
    // closure to catch j
    if (ary !== current_ary) {
      var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        name + '(' + args + ')'
      )
      var menuItem = new eYo.MenuItem(content, function () {
        block.eyo.data.ary.setTrusted(ary)
      })
      mgr.addChild(menuItem, true)
    }
  }
  F(M.NO_ARY, '')
  F(M.UNARY, '…')
  F(M.BINARY, '…, …')
  F(M.TERNARY, '…, …, …')
  F(M.N_ARY, '…, …, …, ...')
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, module call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.base_call_expr.makeSubclass('module_call_expr', {
  data: {
    module: {
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin_name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    }
  },
  fields: {
    module: {
      order: 2,
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER
    }
  }
})

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('module_call_stmt', {
  link: eYo.T3.Expr.module_call_expr
})

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('call_expr', {
  data: {
    variant: {
      NAME: 0,
      BUILTIN: 1,
      EXPRESSION: 2,
      all: [0, 1, 2],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var M = this.model
        var withExpression = newValue === M.EXPRESSION
        this.data.name.setIncog(withExpression)
        this.data.name.required = newValue === M.NAME
        this.owner_.slots.expression.setIncog(!withExpression)
        this.owner_.slots.expression.required = withExpression
      }
    },
    ary: {
      N: Infinity,
      NONE: '0',
      ONE: '1',
      TWO: '2',
      all: [Infinity, '0', '1', '2'], // default value is Infinity
      validate: /** @suppress {globalThis} */ function (newValue) {
        // only for builtin functions
        if (this.data.variant.get() === this.data.variant.model.BUILTIN) {
          switch (this.data.name.get()) {
            case 'int':
            case 'float':
            case 'len':
            return newValue === this.model.ONE ? {validated: newValue}: null
            case 'list':
            case 'set':
            case 'sum':
            default:
            return newValue === this.model.N ? {validated: newValue}: null
          }
        }
        return {validated: newValue}
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var idx = this.model.all.indexOf(newValue)
        this.owner_.slots.n_ary.setIncog(idx !== 0)
        this.owner_.slots.no_ary.setIncog(idx !== 1)
        this.owner_.slots.unary.setIncog(idx !== 2)
        this.owner_.slots.binary.setIncog(idx !== 3)
      },
      xml: false
    },
    backup: {
      noUndo: true,
      xml: false
    },
    name: {
      all: ['int', 'float', 'list', 'set', 'len', 'sum'],
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin_name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var M = this.data.variant.model
        var variant = this.data.variant.get()
        var builtin = this.getAll().indexOf(newValue) >= 0
        if (variant !== M.EXPRESSION) {
          variant = this.data.variant.get() || 0
          this.data.variant.set(builtin ? M.BUILTIN : M.NAME)
        }
        if (builtin) {
          switch (newValue) {
            case 'int':
            case 'float':
            case 'len':
            this.data.ary.set(this.data.ary.model.ONE)
            break
            case 'list':
            case 'set':
            case 'sum':
            this.data.ary.set(this.data.ary.model.N)
          }
        } else {
          this.data.backup.set(newValue)
        }
      },
      synchronize: /** @suppress {globalThis} */ function () {
        this.synchronize()
        var field = this.field
        var element = field && field.textElement_
        if (element) {
          var variant = this.data.variant
          var i = variant.get() === variant.model.BUILTIN ? 0 : 1
          var ra = ['eyo-code', 'eyo-code-reserved']
          goog.dom.classlist.remove(element, ra[i])
          goog.dom.classlist.add(element, ra[1 - i])
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    }
  },
  fields: {
    name: {
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER
    }
  },
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          var variant = this.owner.data.variant
          variant.set(variant.model.EXPRESSION)
        }
      }
    },
    n_ary: {
      order: 2,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list
    },
    no_ary: {
      order: 3,
      fields: {
        start: '(',
        end: ')'
      },
      xml: false
    },
    unary: {
      order: 4,
      fields: {
        start: '(',
        end: ')'
      },
      check: eYo.T3.Expr.Check.argument_any,
      optional: true
    },
    binary: {
      order: 5,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_2
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.call_expr.populateMenu = function (block, mgr) {
  var M = this.data.variant.model
  var variant = this.data.variant.get()
  var names = this.data.name.getAll()
  var i_name = names.indexOf(this.data.name.get())
  var aries = this.data.ary.getAll()
  var i_ary = aries.indexOf(this.data.ary.get())
  if (variant !== 0) {
    var oldValue = block.eyo.data.backup.get()
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      oldValue ? eYo.Do.createSPAN(oldValue, 'eyo-code') : eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    var menuItem = new eYo.MenuItem(content, function () {
      block.eyo.doAndRender(block, function () {
        this.data.name.setTrusted(oldValue || '')
        this.data.variant.set(M.NAME)
      })
    })
    mgr.addChild(menuItem, true)
  }
  var F = function (i) {
    // closure to catch j
    if (i !== i_name) {
      content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN(names[i], 'eyo-code-reserved'),
        eYo.Do.createSPAN('(…)', 'eyo-code')
      )
      var menuItem = new eYo.MenuItem(content, function () {
        block.eyo.doAndRender(block, function () {
          this.data.name.setTrusted(names[i])
          this.data.variant.set(M.BUILTIN)
        })
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < names.length; i++) {
    F(i)
  }
  if (variant !== M.EXPRESSION) {
    content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    menuItem = new eYo.MenuItem(content, function () {
      block.eyo.doAndRender(block, function () {
        this.data.name.setTrusted(oldValue || '')
        this.data.variant.set(M.EXPRESSION)
      })
    })
    mgr.addChild(menuItem, true)
  }
  if (variant === M.EXPRESSION || variant === M.NAME) {
    mgr.separate()
    F = function (i, args) {
      // closure to catch j
      if (i !== i_ary) {
        content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
          'foo(' + args + ')'
        )
        var menuItem = new eYo.MenuItem(content, function () {
          block.eyo.data.ary.setTrusted(aries[i])
        })
        mgr.addChild(menuItem, true)
      }
    }
    F(1, '')
    F(2, '…')
    F(3, '…, …')
    F(0, '…, …, …, ...')
  }
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('call_stmt', {
  link: eYo.T3.Expr.call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

eYo.DelegateSvg.Primary.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Expr.attributeref,
  eYo.T3.Expr.slicing,
  eYo.T3.Expr.subscription,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt,
  eYo.T3.Expr.base_call_expr,
  eYo.T3.Stmt.module_call_expr,
  eYo.T3.Stmt.module_call_stmt
]
