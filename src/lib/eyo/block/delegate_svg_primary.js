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

goog.require('eYo.Model.stdtypes')
goog.require('eYo.Model.functions')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Expr')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, number: integer, floatnumber or imagnumber.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('primary', {
  xml: {
    types: [
      eYo.T3.Expr.term,
      eYo.T3.Expr.attributeref,
      eYo.T3.Expr.subscription,
      eYo.T3.Expr.slicing,
      eYo.T3.Expr.call_expr,      
    ]
  },
  data: {
    variant: {
      order: 100,
      NAME: eYo.Key.NAME,
      EXPR: eYo.Key.EXPR,
      PARENT_NAME: eYo.Key.PARENT_NAME,
      PARENT_EXPR: eYo.Key.PARENT_EXPR,
      BLOCK_NAME: eYo.Key.BLOCK_NAME,
      BLOCK_EXPR: eYo.Key.BLOCK_EXPRNAME,
      all: [
        eYo.Key.NAME,
        eYo.Key.EXPR,
        eYo.Key.PARENT_NAME,
        eYo.Key.PARENT_EXPR,
        eYo.Key.BLOCK_NAME,
        eYo.Key.BLOCK_EXPR
      ],
      init: eYo.Key.NAME,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var parent_d = this.data.parent
        var name_d = this.data.name
        var option_d = this.data.option
        var slots = this.owner.slots
        var f = function (yorn_parent, yorn_block, yorn_name, yorn_expr) {
          parent_d.required = yorn_parent && !yorn_block
          parent_d.setIncog()
          var slot = slots.primary
          slot.required = yorn_parent && yorn_block
          slot.setIncog()
          slots.dot.setIncog(!yorn_parent)
        }
        if (newValue === this.PARENT_NAME) {
          f(true, false)
        } else if (newValue === this.BLOCK_NAME) {
          f(true, true)
        } else /* if (newValue === this.NAME) */ {
          f(false)
        }
        // force sync, usefull when switching to and from BLOCK_NAME variant
        name_d.synchronize()
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.owner.setupType(this.owner.getType())
        this.owner.setupConnections()
      }
    },
    option: {
      order: 101,
      NONE: eYo.Key.NONE,
      CALL_EXPR: eYo.Key.CALL_EXPR,
      SLICING: eYo.Key.SLICING,
      all: [
        eYo.Key.NONE,
        eYo.Key.CALL_EXPR,
        eYo.Key.SLICING
      ],
      init: eYo.Key.CALL_EXPR,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var option = this.get()
        if(option === this.CALL_EXPR) {
          this.owner.slots.arguments.setIncog(false)
          this.owner.slots.slicing.setIncog(true)
        } else if(option === this.SLICING) {
          this.owner.slots.arguments.setIncog(true)
          this.owner.slots.slicing.setIncog(false)
        } else {
          this.owner.slots.arguments.setIncog(true)
          this.owner.slots.slicing.setIncog(true)
        }
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.owner.setupType(this.owner.getType())
        this.owner.setupConnections()
      }
    },
    ary: {
      order: 20,
      init: Infinity,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var validated
        if (goog.isString(newValue)) {
          if (newValue.length) {
            validated = Math.max(0, Math.floor(Number(newValue)))
          } else {
            validated = Infinity
          }
        } else {
          validated = Math.max(0, Math.floor(newValue))
        }
        return {validated: validated}
      },
      willChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // First change the ary of the arguments list, then change the ary of the delegate.
        // That way undo events are recorded in the correct order.
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.ary.set(newValue)
          }
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var ary = this.get()
          if (ary < Infinity) {
            element.setAttribute('ary', ary)
          }
        }
      }
    },
    mandatory: {
      order: 21,
      noUndo: true,
      xml: false,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return goog.isNumber(newValue) && newValue > 0 ? {validated: Math.floor(newValue)} : null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.mandatory.set(newValue)
          }
        }
      }
    },
    parent: {
      order: 50,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type.raw === eYo.T3.Expr.builtin__name
        || type.expr === eYo.T3.Expr.identifier
        || type.expr === eYo.T3.Expr.dotted_name
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      },
      synchronize: true,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant_d = this.owner.data.variant
            var current = variant_d.get()
            if (current !== variant_d.NAME && current !== variant_d.BUILTIN && current !== variant_d.PARENT_NAME) {
              variant_d.set(variant_d.NAME)
            }
          }
        }
      }
    },
    name: {
      order: 55,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type.raw === eYo.T3.Expr.builtin__name
        || type.expr === eYo.T3.Expr.identifier
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      },
      synchronize: true,
      xml: {
        load: /** @suppress {globalThis} */ function (element) {
          this.load(element)
          if (this.isRequiredFromDom()) {
            var variant_d = this.owner.data.variant
            var variant = variant_d.get()
            if (variant !== variant_d.PARENT_NAME && variant !== variant_d.BLOCK_NAME) {
              if (variant !== variant_d.NAME) {
                variant_d.set(variant_d.PARENT_NAME)
              } else {
                variant_d.set(variant_d.BLOCK_NAME)
              }              
            }
          }
        }
      }
    }
  },
  slots: {
    parent: {
      order: 50,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER
        }
      }
    },
    primary: {
      order: 51,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary',
      xml: {
        tag: 'parent',
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant_d = this.owner.data.variant
            var variant = variant_d.get()
            if (variant !== variant_d.BLOCK && variant !== variant_d.BLOCK_NAME) {
              if (variant === variant_d.PARENT_NAME) {
                variant_d.set(variant_d.BLOCK_NAME)
              } else {
                variant_d.set(variant_d.BLOCK)
              }
            }
          }
        }
      }
    },
    dot: {
      order: 75,
      fields: {
        separator: '.'
      }
    },
    name: {
      order: 100,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.ATTRIBUTE,
          variable: true
        }
      }
    },
    arguments: {
      order: 1000,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list
    },
    slicing: {
      order: 2000,
      fields: {
        start: '[',
        end: ']'
      },
      wrap: eYo.T3.Expr.slice_list
    }
  },
  output: {
    check: function () {
      var option_d = this.owner.data.option
      var option = option_d.get()
      if (option === option_d.CALL_EXPR) {
        return [eYo.T3.Expr.call_expr]
      } else if (option === option_d.SLICING) {
        return [eYo.T3.Expr.subscription, eYo.T3.Expr.slicing]
      } else {
        var variant_d = this.owner.data.variant
        var variant = variant_d.get()
        if (variant === variant_d.NAME || variant === variant_d.BUILTIN) {
          return [eYo.T3.Expr.term]
        } else if (variant === variant_d.PARENT_NAME || variant === variant_d.BLOCK_NAME) {
          return [eYo.T3.Expr.attributeref]
        } else {
          var slot = this.owner.slots.primary
          var input = slot.input
          var c8n = input.connection
          var target = c8n && c8n.targetBlock()
          if (target) {
            return target.outputConnection.check_
          }
          return [eYo.T3.Expr.any]
        }
        // unreachable
      }
      // unreachable
    }
  }
})

eYo.DelegateSvg.Expr.call_expr =
eYo.DelegateSvg.Expr.attributeref =
eYo.DelegateSvg.Expr.slicing =
eYo.DelegateSvg.Expr.subscription =
eYo.DelegateSvg.Expr.primary
eYo.DelegateSvg.Manager.register('subscription')
eYo.DelegateSvg.Manager.register('slicing')
eYo.DelegateSvg.Manager.register('attributeref')
eYo.DelegateSvg.Manager.register('call_expr')

/**
 * Fetches the named input object, getInput.
 * This is not a very strong design but it should work, I guess.
 * @param {!Block} block
 * @return {String} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.DelegateSvg.Expr.primary.prototype.getType = function (block) {
  var option_d = this.data.option
  var option = option_d.get()
  if (option === option_d.CALL_EXPR) {
    return eYo.T3.Expr.call_expr
  } else if (option === option_d.SLICING) {
    // which one : slicing or subscription ?
    return eYo.T3.Expr.slicing
  } else {
    var variant_d = this.data.variant
    var variant = variant_d.get()
    if (variant === variant_d.NAME || variant === variant_d.BUILTIN) {
      return eYo.T3.Expr.term
    } else if (variant === variant_d.PARENT_NAME || variant === variant_d.BLOCK_NAME) {
      return eYo.T3.Expr.attributeref
    } else {
      var slot = this.slots.primary
      var input = slot.input
      var c8n = input.connection
      var target = c8n && c8n.targetBlock()
      if (target) {
        return target.eyo.getType && target.eyo.getType() || target.type
      }
      return eYo.T3.Expr.any
    }
    // unreachable
  }
  // unreachable
}

/**
 * Fetches the named input object, getInput.
 * This is not a very strong design but it should work, I guess.
 * @param {!Block} block
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.DelegateSvg.Expr.primary.prototype.getInput = function (block, name) {
  var input = eYo.DelegateSvg.Expr.primary.superClass_.getInput.call(this, block, name)
  if (!input) {
    // we suppose that ary is set
    var f = function (slot) {
      if (!slot.isIncog()) {
        var input = slot.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target && (input = target.getInput(name))) {
            return true
          }
        }
      }
    }
    f(this.slots.arguments) || f(this.slots.slicing)
  }
  return input
}

/**
 * Class for a DelegateSvg, base call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('pre_call_stmt', {
  link: eYo.T3.Expr.primary
}, eYo.DelegateSvg.Stmt)

/**
 * Class for a DelegateSvg, base call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.pre_call_stmt.makeSubclass('call_stmt', {
  data: {
    option: {
      init: eYo.Key.CALL_EXPR,
      validate: function (newValue) {
        return {validated: eYo.Key.CALL_EXPR}
      }
    }
  }
}, eYo.DelegateSvg.Stmt)

/**
 * Class for a DelegateSvg, base call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('base_call_expr', {
  data: {
    callerFlag: {
      order: 100,
      init: false, // true iff `foo` is expected instead of `foo(…)`
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          if (this.get()) {
            element.setAttribute('caller', 'true')
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          var attr = element.getAttribute('caller')
          this.set(attr && attr === 'true')
        }
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.owner.slots.arguments.setIncog(newValue)
      },
    },
    ary: {
      order: 200,
      init: Infinity,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var validated
        if (goog.isString(newValue)) {
          if (newValue.length) {
            validated = Math.max(0, Math.floor(Number(newValue)))
          } else {
            validated = Infinity
          }
        } else {
          validated = Math.max(0, Math.floor(newValue))
        }
        return {validated: validated}
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var callerFlag_d = this.data.callerFlag
        var caller = callerFlag_d && callerFlag_d.get()
        this.owner.slots.arguments.setIncog(caller)
      },
      willChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // First change the ary of the arguments list, then change the ary of the delegate.
        // That way undo events are recorded in the correct order.
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.ary.set(newValue)
          }
        }
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          var ary = this.get()
          if (ary < Infinity) {
            element.setAttribute('ary', ary)
          }
        }
      }
    },
    parent: {
      order: 50,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type.raw === eYo.T3.Expr.builtin__name
        || type.expr === eYo.T3.Expr.identifier
        || type.expr === eYo.T3.Expr.dotted_name
        ? {validated: newValue} : null
        // return this.getAll().indexOf(newValue) < 0? null : {validated: newValue} // what about the future ?
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      },
      synchronize: true,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant = this.owner.data.variant
            var current = variant.get()
            if (current !== variant.NAME && current !== variant.BUILTIN) {
              variant.set(variant.NAME)
            }
          }
        }
      }
    },
    isOptionalUnary: {
      order: 2000,
      noUndo: true,
      xml: false,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return goog.isBoolean(newValue) ? {validated: newValue} : null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.slots.unary
        slot && (slot.input.connection.eyo.optional_ = this.get())
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            var ary_n
            try {
              ary_n = Number(newValue)
            } catch (err) {
              ary_n = Infinity
            }
            target.eyo.data.ary.set(ary_n)
          }
        }
      }
    },
    mandatory: {
      order: 200,
      noUndo: true,
      xml: false,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return goog.isNumber(newValue) && newValue > 0 ? {validated: Math.floor(newValue)} : null
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.slots.unary
        slot && (slot.input.connection.eyo.optional_ = this.get())
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var input = this.owner.slots.arguments.input
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target) {
            target.eyo.data.mandatory.set(newValue)
          }
        }
      }
    }
  },
  slots: {
    parent: {
      order: 50,
      fields: {
        edit: {
          validate: true,
          endEditing: true,
          placeholder: eYo.Msg.Placeholder.IDENTIFIER
        }
      }
    },
    arguments: {
      order: 1000,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list
    }
  },
  output: {
    check: [eYo.T3.Expr.call_expr]
  }
})

/**
 * Fetches the named input object, getInput.
 * This is not a very strong design but it should work, I guess.
 * @param {!Block} block
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {Blockly.Input} The input object, or null if input does not exist or undefined for the default block implementation.
 */
eYo.DelegateSvg.Expr.base_call_expr.prototype.getInput = function (block, name) {
  var input = eYo.DelegateSvg.base_call_expr.superClass_.getInput.call(this, block, name)
  if (!input) {
    // we suppose that ary is set
    var f = function (slot) {
      if (!slot.isIncog()) {
        var input = slot.getInput()
        if (input && input.connection) {
          var target = input.connection.targetBlock()
          if (target && (input = target.getInput(name))) {
            return true
          }
        }
      }
    }
    f(slots.binary, this.BINARY)
    || f(slots.ternary, this.TERNARY)
    || f(slots.quadary, this.QUADARY)
    || f(slots.pentary, this.PENTARY)
    || f(slots.n_ary, this.N_ARY)
  }
  return input
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.base_call_expr.populateMenu = function (block, mgr) {
  var callerFlag_d = this.data.callerFlag
  var caller = callerFlag_d.get()
  var content = this.contentTemplate(block)
  var content = caller
  ? goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    content,
    '(…)'
  )
  : content
  var menuItem = mgr.newMenuItem(content, function () {
    callerFlag_d.setTrusted(!caller)
  })
  mgr.addChild(menuItem, true)
  var ary_d = this.data.ary
  var current_ary = ary_d.get()
  var self = this
  var F = function (ary, args) {
    if (ary !== current_ary) {
      var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        self.contentTemplate(block),
        '(',
        args,
        ')'
      )
      var menuItem = mgr.newMenuItem(content, self.doAndRender(block, function () {
        ary_d.setTrusted(ary)
        callerFlag_d.setTrusted(false)
      }, true))
      mgr.addChild(menuItem, true)
    }
  }
  F(ary_d.Z_ARY, '')
  F(ary_d.UNARY, '…')
  F(ary_d.BINARY, '…, …')
  F(ary_d.TERNARY, '…, …, …')
  F(ary_d.N_ARY, '…, …, …, ...')
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
eYo.DelegateSvg.Expr.base_call_expr.populateMenuCaller = function (block, mgr) {
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.base_call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
  eYo.DelegateSvg.Expr.base_call_expr.populateMenuCaller.call(this, block, mgr)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('base_call_stmt', {
  link: eYo.T3.Expr.primary
}, eYo.DelegateSvg.Stmt)

eYo.DelegateSvg.Stmt.base_call_stmt.prototype.getType = eYo.DelegateSvg.Expr.primary.prototype.getType

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.base_call_stmt.makeSubclass('call_stmt', {
})

eYo.DelegateSvg.Expr.primary.T3s = [
  eYo.T3.Expr.primary,
  eYo.T3.Expr.term,
  eYo.T3.Expr.attributeref,
  eYo.T3.Expr.slicing,
  eYo.T3.Expr.subscription,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt
]
