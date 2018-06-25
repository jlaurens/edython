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
        return type === eYo.T3.Expr.builtin__name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
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
        separator: '.',
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
      NAME: 0,
      PRIMARY: 1,
      all: [0, 1],
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.data.name.setIncog(!!newValue) // not the slot !
        this.owner_.slots.primary.setIncog(!newValue)
        this.owner_.slots.primary.required = !!newValue
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
      hole_value: 'primary',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant = this.owner.data.variant
            variant.set(variant.model.PRIMARY)
          }
        }
      }
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
 * Consolidate the block.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.slicing.prototype.consolidate = function (block) {
  if (this.slots.primary.isRequiredFromDom()) {
    this.slots.primary.setRequiredFromDom(false)
    this.data.variant.set(this.data.variant.model.PRIMARY)
  }
  eYo.DelegateSvg.Expr.slicing.superClass_.consolidate.call(this, block)
}

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
      order: 10,
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
      order: 1,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin__name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
          ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    },
    isOptionalUnary: {
      order: 2000,
      noUndo: true,
      xml: false,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return goog.isBoolean(newValue) ? {validated: newValue} : null
      },
      synchronize: /** @suppress {globalThis} */ function () {
        this.owner_.slots.unary.input.connection.eyo.optional_ = this.get()
      }
    }
  },
  fields: {
    name: {
      order: 3,
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.IDENTIFIER
    }
  },
  slots: {
    n_ary: {
      order: 100,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list
    },
    no_ary: {
      order: 101,
      fields: {
        start: '(',
        end: ')'
      }
    },
    unary: {
      order: 102,
      fields: {
        start: '(',
        end: ')'
      },
      check: eYo.T3.Expr.Check.argument_any,
      optional: false
    },
    binary: {
      order: 103,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_2
    },
    ternary: {
      order: 104,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_3
    }
  },
  output: {
    check: [eYo.T3.Expr.call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.base_call_expr.populateMenu = function (block, mgr) {
  var M = this.data.ary.model
  var current_ary = this.data.ary.get()
  var name = this.contentTemplate(block)
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
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.base_call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, base call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('base_call_stmt', {
  link: eYo.T3.Expr.base_call_expr
})

/**
 * Template for contextual menu content.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.base_call_expr.prototype.contentTemplate = eYo.DelegateSvg.Stmt.base_call_stmt.prototype.contentTemplate = function (block) {
  return this.data.name.get() || 'foo'
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.base_call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
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
      order: 2,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin__name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name
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
      order: 1,
      validate: true,
      endEditing: true,
      placeholder: eYo.Msg.Placeholder.MODULE
    },
    separator: {
      order: 2,
      value: '.'
    }
  }
})

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.base_call_stmt.makeSubclass('module_call_stmt', {
  link: eYo.T3.Expr.module_call_expr
})

/**
 * Template for contextual menu content.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.module_call_expr.prototype.contentTemplate = eYo.DelegateSvg.Stmt.module_call_stmt.prototype.contentTemplate = function (block) {
  return (this.data.module.get() || 'foo') + '.' + (this.data.module.get() || 'bar')
}

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.base_call_expr.makeSubclass('call_expr', {
  data: {
    variant: {
      order: 100,
      NAME: 0,
      BUILTIN: 1,
      EXPRESSION: 2,
      ATTRIBUTE: 3,
      all: [0, 1, 2, 3],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var M = this.model
        if (newValue === M.ATTRIBUTE) {
          this.data.name.setIncog(false)
          this.data.name.required = true
          this.owner_.slots.dot.setIncog(false)
          this.owner_.slots.expression.setIncog(false)
          this.owner_.slots.expression.required = true
        } else if (newValue === M.EXPRESSION) {
          this.data.name.setIncog(true)
          this.data.name.required = false
          this.owner_.slots.dot.setIncog(true)
          this.owner_.slots.expression.setIncog(false)
          this.owner_.slots.expression.required = true
        } else /* if (newValue === M.NAME || newValue === M.BUILTIN) */ {
          this.data.name.setIncog(false)
          this.data.name.required = true
          this.owner_.slots.dot.setIncog(true)
          this.owner_.slots.expression.setIncog(true)
          this.owner_.slots.expression.required = false
        }
        // force sync, usefull when switching to and from ATTRIBUTE variant
        this.data.name.synchronize()
      }
    },
    ary: {
      validate: /** @suppress {globalThis} */ function (newValue) {
        // only for builtin functions
        if (this.data.variant.get() === this.data.variant.model.BUILTIN) {
          switch (this.data.name.get()) {
            case 'int':
            case 'float':
            case 'len':
            case 'input':
            return newValue === this.model.UNARY ? {validated: newValue}: null
            case 'list':
            case 'set':
            case 'sum':
            default:
            return newValue === this.model.N_ARY ? {validated: newValue}: null
          }
        }
        return {validated: newValue}
      }
    },
    backup: {
      order: 1000,
      noUndo: true,
      xml: false
    },
    name: {
      all: ['input', 'int', 'float', 'list', 'set', 'len', 'sum'],
      init: 'int',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.builtin__name || type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name || newValue === ''
          ? {validated: newValue} : null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var M = this.data.variant.model
        var variant = this.data.variant.get()
        var isBuiltin = this.getAll().indexOf(newValue) >= 0
        if (isBuiltin) {
          if (variant === M.NAME) {
            this.data.variant.set(M.BUILTIN)
          }
          switch (newValue) {
            case 'int':
            case 'float':
            case 'len':
            this.data.isOptionalUnary.set(false)
            this.data.ary.set(this.data.ary.model.UNARY)
            break
            case 'input':
            this.data.isOptionalUnary.set(true)
            this.data.ary.set(this.data.ary.model.UNARY)
            break
            case 'list':
            case 'set':
            case 'sum':
            this.data.ary.set(this.data.ary.model.N_ARY)
          }
        } else {
          if (variant === M.BUILTIN) {
            this.data.variant.set(M.NAME)
          }
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
      validate: null,
      endEditing: null,
      placeholder: null
      // validate: true,
      // endEditing: true,
      // placeholder: eYo.Msg.Placeholder.IDENTIFIER
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
          if (this.isRequiredFromDom()) {
            var variant = this.owner.data.variant
            var name = this.owner.data.name
            variant.set(name.isRequiredFromDom() || name.get().length ? variant.model.ATTRIBUTE : variant.model.EXPRESSION)
          }
        }
      }
    },
    dot: {
      order: 2,
      fields: {
        separator: '.'
      }
    },
    name: {
      order: 3,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER
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
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.call_expr.populateMenu = function (block, mgr) {
  var M = this.data.variant.model
  var variant = this.data.variant.get()
  var names = this.data.name.getAll()
  var i_name = names.indexOf(this.data.name.get())
  var oldValue = block.eyo.data.backup.get()
  if (variant !== M.NAME) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      oldValue ? eYo.Do.createSPAN(oldValue, 'eyo-code') : eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    var menuItem = new eYo.MenuItem(content, this.doAndRender(block, function () {
      this.data.name.setTrusted(oldValue || '')
      this.data.variant.set(M.NAME)
    }, true))
    mgr.addChild(menuItem, true)
  }
  var F = function (i) {
    // closure to catch j
    if (i !== i_name) {
      content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
        eYo.Do.createSPAN(names[i], 'eyo-code-reserved'),
        eYo.Do.createSPAN('(…)', 'eyo-code')
      )
      var menuItem = new eYo.MenuItem(content, block.eyo.doAndRender(block, function () {
        this.data.name.setTrusted(names[i])
        this.data.variant.set(M.BUILTIN)
      }, true))
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
    menuItem = new eYo.MenuItem(content, block.eyo.doAndRender(block, function () {
      this.data.name.setTrusted(oldValue || '')
      this.data.variant.set(M.EXPRESSION)
    }, true))
    mgr.addChild(menuItem, true)
  }
  if (variant !== M.BUILTIN) {
    mgr.separate()
    eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
  }
  if (variant !== M.ATTRIBUTE) {
    mgr.separate()
    content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('.', 'eyo-code-placeholder'),
      eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    menuItem = new eYo.MenuItem(content, block.eyo.doAndRender(block, function () {
      if (variant === M.BUILTIN) {
        this.data.name.setTrusted(oldValue || '')
      }
      this.data.variant.set(M.ATTRIBUTE)
    }, true))
    mgr.addChild(menuItem, true)
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
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
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
  eYo.T3.Expr.base_call_expr,
  eYo.T3.Stmt.base_call_stmt,
  eYo.T3.Expr.module_call_expr,
  eYo.T3.Stmt.module_call_stmt,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt
]
