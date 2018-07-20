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
      PARENT_NAME: eYo.Key.PARENT_NAME,
      PRIMARY_NAME: eYo.Key.PRIMARY_NAME,
      all: [
        eYo.Key.NAME,
        eYo.Key.PARENT_NAME,
        eYo.Key.PRIMARY_NAME
      ],
      init: eYo.Key.NAME,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var parent_d = this.data.parent
        var name_d = this.data.name
        var option_d = this.data.option
        var slots = this.owner.slots
        var f = function (yorn_parent, yorn_primary) {
          parent_d.required = yorn_parent && !yorn_primary
          parent_d.setIncog()
          var slot = slots.primary
          slot.required = yorn_parent && yorn_primary
          slot.setIncog()
          slots.dot.setIncog(!yorn_parent)
        }
        if (newValue === this.PARENT_NAME) {
          f(true, false)
        } else if (newValue === this.PRIMARY_NAME) {
          f(true, true)
        } else /* if (newValue === this.NAME) */ {
          f(false)
        }
        // force sync, usefull when switching to and from PRIMARY_NAME variant
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
            validated = Math.max(0, Math(floor(Number(newValue))))
          } else {
            validated = Infinity
          }
        } else {
          validated = Math.max(0, Math(floor(newValue)))
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
            if (variant !== variant_d.PARENT_NAME && variant !== variant_d.PRIMARY_NAME) {
              if (variant !== variant_d.NAME) {
                variant_d.set(variant_d.PARENT_NAME)
              } else {
                variant_d.set(variant_d.PRIMARY_NAME)
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
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant_d = this.owner.data.variant
            var variant = variant_d.get()
            if (variant !== variant_d.PRIMARY && variant !== variant_d.PRIMARY_NAME) {
              if (variant === variant_d.PARENT_NAME) {
                variant_d.set(variant_d.PRIMARY_NAME)
              } else {
                variant_d.set(variant_d.PRIMARY)
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
        } else if (variant === variant_d.PARENT_NAME || variant === variant_d.PRIMARY_NAME) {
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
    } else if (variant === variant_d.PARENT_NAME || variant === variant_d.PRIMARY_NAME) {
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
    f(slots.arguments) || f(slots.slicing)
  }
  return input
}

/**
 * Class for a DelegateSvg, attributeref.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
// eYo.DelegateSvg.Expr.makeSubclass('attributeref', {
//   data: {
//     name: {
//       init: '',
//       validate: /** @suppress {globalThis} */ function (newValue) {
//         var type = eYo.Do.typeOfString(newValue)
//         return type.raw === eYo.T3.Expr.builtin__name
//         || type.expr === eYo.T3.Expr.identifier
//         || type.expr === eYo.T3.Expr.dotted_name
//         ? {validated: newValue} : null
//       },
//       synchronize: true
//     }
//   },
//   slots: {
//     primary: {
//       order: 1,
//       check: eYo.T3.Expr.Check.primary,
//       plugged: eYo.T3.Expr.primary,
//       hole_value: 'primary'
//     },
//     name: {
//       order: 2,
//       fields: {
//         separator: '.',
//         edit: {
//           validate: true,
//           endEditing: true,
//           placeholder: eYo.Msg.Placeholder.ATTRIBUTE,
//           variable: true
//         }
//       }
//     }
//   }
// })

/**
 * Class for a DelegateSvg, subscription and slicing.
 * Due to the ambibuity, it is implemented only once for both.
 * Slicing is richer.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
// eYo.DelegateSvg.Expr.makeSubclass('slicing', {
//   data: {
//     variant: { // data named 'variant' have `xml = false`, by default
//       NAME: eYo.Key.NAME,
//       PRIMARY: eYo.Key.PRIMARY,
//       all: [
//         eYo.Key.NAME,
//         eYo.Key.PRIMARY
//       ],
//       didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
//         this.data.parent.setIncog(newValue !== this.NAME) // not the slot !
//         var slot = this.owner.slots.primary
//         slot.required = newValue === this.PRIMARY
//         slot.setIncog(!slot.required)
//       }
//     },
//     parent: {
//       init: '',
//       validate: /** @suppress {globalThis} */ function (newValue) {
//         var type = eYo.Do.typeOfString(newValue).expr
//         return type === eYo.T3.Expr.identifier
//         || type === eYo.T3.Expr.dotted_name
//         ? {validated: newValue} : null
//       },
//       synchronize: true
//     }
//   },
//   slots: {
//     parent: {
//       order: 1,
//       fields: {
//         edit: {
//           validate: true,
//           endEditing: true,
//           placeholder: eYo.Msg.Placeholder.IDENTIFIER,
//           variable: true
//         }
//       }
//     },
//     primary: {
//       order: 2,
//       check: eYo.T3.Expr.Check.primary,
//       plugged: eYo.T3.Expr.primary,
//       hole_value: 'primary',
//       xml: {
//         didLoad: /** @suppress {globalThis} */ function () {
//           if (this.isRequiredFromDom()) {
//             var variant = this.owner.data.variant
//             variant.set(variant.model.PRIMARY)
//           }
//         }
//       }
//     },
//     slice: {
//       order: 3,
//       fields: {
//         start: '[',
//         end: ']'
//       },
//       wrap: eYo.T3.Expr.slice_list
//     }
//   },
//   output: {
//     check: [eYo.T3.Expr.subscription, eYo.T3.Expr.slicing]
//   }
// })

// eYo.DelegateSvg.Expr.subscription = eYo.DelegateSvg.Expr.slicing
// eYo.DelegateSvg.Manager.register('subscription')

/**
 * Consolidate the block.
 * @param {!Blockly.Block} block The block.
 */
// eYo.DelegateSvg.Expr.slicing.prototype.consolidate = function (block) {
//   if (this.slots.primary.isRequiredFromDom()) {
//     this.slots.primary.setRequiredFromDom(false)
//     this.data.variant.set(this.data.variant.model.PRIMARY)
//   }
//   eYo.DelegateSvg.Expr.slicing.superClass_.consolidate.call(this, block)
// }

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
// eYo.DelegateSvg.Expr.slicing.prototype.populateContextMenuFirst_ = function (block, mgr) {
//   var variant = this.data.variant
//   var current = variant.get()
//   var F = function (content, j) {
//     var menuItem = mgr.newMenuItem(content, function () {
//       block.eyo.data.variant.set(j)
//     })
//     mgr.addChild(menuItem, true)
//     menuItem.setEnabled(j !== current)
//   }
//   var parent = this.data.parent.get()
//   var content =
//   goog.dom.createDom(goog.dom.TagName.SPAN, null,
//     eYo.Do.createSPAN(parent || eYo.Msg.Placeholder.IDENTIFIER, parent ? 'eyo-code' : 'eyo-code-placeholder'),
//     eYo.Do.createSPAN('[…]', 'eyo-code')
//   )
//   F(content, variant.NAME)
//   content =
//   goog.dom.createDom(goog.dom.TagName.SPAN, null,
//     eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
//     eYo.Do.createSPAN('[…]', 'eyo-code')
//   )
//   F(content, variant.PRIMARY)
//   mgr.shouldSeparate()
//   return eYo.DelegateSvg.Expr.slicing.superClass_.populateContextMenuFirst_.call(this, block, mgr)
// }

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
            validated = Math.max(0, Math(floor(Number(newValue))))
          } else {
            validated = Infinity
          }
        } else {
          validated = Math.max(0, Math(floor(newValue)))
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
  return this.data.parent.get() || 'foo'
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.base_call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
  eYo.DelegateSvg.Expr.base_call_expr.populateMenuCaller.call(this, block, mgr)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, module call block.
 * This is for a call with a module prefix.
 * The same block will run for explicit and implicit calls
 * eg `math.sqrt` and `sqrt`. In order to switch between both options,
 * we add an `fromFlag` data similar to the `variant` data but with only 2 values.
 * For edython.
 */
eYo.DelegateSvg.Expr.primary.makeSubclass('module__call_expr', {
})

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.base_call_stmt.makeSubclass('module__call_stmt', {
  link: eYo.T3.Expr.module__call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.module__call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
  mgr.shouldSeparate()
  eYo.DelegateSvg.Expr.module__call_expr.populateMenu.call(this, block, mgr, '(…)')
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Get the module.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.module__call_expr.prototype.getModule = eYo.DelegateSvg.Stmt.module__call_stmt.prototype.getModule = function (block) {
  return this.data.parent.get()
}

/**
 * Template for contextual menu content.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.module__call_expr.prototype.contentTemplate = eYo.DelegateSvg.Stmt.module__call_stmt.prototype.contentTemplate = function (block, invert) {
  var flag = this.data.fromFlag.get()
  if (invert) {
    flag = !flag
  }
  var module = this.getModule(block)
  var parent = this.data.parent.get()
  if (parent) {
    if (!flag) {
      if (module) {
        return module + '.' + name
      }
    } else {
      return name
    }
  } else {
    name = goog.dom.createDom(
      goog.dom.TagName.SPAN,
      'eyo-code-placeholder',
      eYo.Msg.Placeholder.IDENTIFIER,
    )
  }
  if (!flag) {
    if (!module) {
      module = goog.dom.createDom(
        goog.dom.TagName.SPAN,
        'eyo-code-placeholder',
        eYo.Msg.Placeholder.MODULE,
      )
    }
    return goog.dom.createDom(
      goog.dom.TagName.SPAN,
      'eyo-code',
      module,
      '.',
      name
    )
  } else {
    return name
  }
}

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
// eYo.DelegateSvg.Expr.base_call_expr.makeSubclass('call_expr', {
//   data: {
//     variant: {
//       order: 100,
//       NAME: eYo.Key.NAME,
//       BUILTIN: eYo.Key.BUILTIN,
//       EXPRESSION: eYo.Key.EXPRESSION,
//       EXPRESSION_ATTRIBUTE: eYo.Key.EXPRESSION_ATTRIBUTE, // the name data is the name
//       all: [
//         eYo.Key.NAME,
//         eYo.Key.BUILTIN,
//         eYo.Key.EXPRESSION,
//         eYo.Key.EXPRESSION_ATTRIBUTE
//       ],
//       init: eYo.Key.NAME,
//       synchronize: /** @suppress {globalThis} */ function (newValue) {
//         this.synchronize(newValue)
//         var data = this.data.parent
//         var slot
//         if (newValue === this.EXPRESSION_ATTRIBUTE) {
//           data.required = true
//           data.setIncog()
//           this.owner.slots.dot.setIncog(false)
//           slot = this.owner.slots.expression
//           slot.required = true
//           slot.setIncog()
//         } else if (newValue === this.EXPRESSION) {
//           data.required = false
//           data.setIncog()
//           this.owner.slots.dot.setIncog(true)
//           slot = this.owner.slots.expression
//           slot.required = true
//           slot.setIncog()
//         } else /* if (newValue === this.NAME || newValue === this.BUILTIN) */ {
//           data.required = true
//           data.setIncog()
//           this.owner.slots.dot.setIncog(true)
//           slot = this.owner.slots.expression
//           slot.required = false
//           slot.setIncog()
//         }
//         // force sync, usefull when switching to and from EXPRESSION_ATTRIBUTE variant
//         this.data.parent.synchronize()
//       }
//     },
//     ary: {
//       validate: /** @suppress {globalThis} */ function (newValue) {
//         var current = this.data.parent.get()
//         var item = eYo.Model.functions.getItem(current) || eYo.Model.stdtypes.getItem(current)
//         if (item) {
//           // this is known, we do not have any choice
//           return {validated: goog.isNumber(item.ary) && item.ary >= 0 ? Math.floor(item.ary) : Infinity}
//         }
//         return {validated: newValue}
//       },
//       xml: {
//         save: /** @suppress {globalThis} */ function (element) {
//           var current = this.data.parent.get()
//           var item = eYo.Model.functions.getItem(current) || eYo.Model.stdtypes.getItem(current)
//           if (!item && this.get() < Infinity) {
//             // this is not a known function name
//             this.save(element)
//           }
//         }
//       }
//     },
//     backup: {
//       order: 1000,
//       noUndo: true,
//       xml: false
//     },
//     parent: {
//       all: ['input', 'int', 'float', 'list', 'set', 'len', 'min', 'max', 'sum', 'trunc', 'pow', 'abs', 'complex'],
//       init: 'int',
//       main: true,
//       validate: /** @suppress {globalThis} */ function (newValue) {
//         var current = this.data.parent.get()
//         var item = eYo.Model.functions.getItem(current) || eYo.Model.stdtypes.getItem(current)
//         if (!item) {
//           var type = eYo.Do.typeOfString(newValue)
//           return type.expr === eYo.T3.Expr.identifier
//           || type.expr === eYo.T3.Expr.dotted_name
//           || newValue === ''
//           ? {validated: newValue} : null  
//         }
//         return {validated: newValue}
//       },
//       didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
//         var current = this.data.parent.get()
//         var item = eYo.Model.functions.getItem(current) || eYo.Model.stdtypes.getItem(current)
//         var variant_d = this.data.variant
//         var variant = variant_d.get()
//         if (item) {
//           if (variant === variant_d.NAME) {
//             this.data.variant.set(variant_d.BUILTIN)
//           }
//           this.data.ary.setTrusted(goog.isNumber(item.ary) && item.ary >= 0? Math.floor(item.ary) : Infinity)
//           this.data.mandatory.setTrusted(goog.isNumber(item.mandatory) && item.mandatory >= 0? Math.floor(item.mandatory) : 0)
//         } else {
//           if (variant === variant_d.BUILTIN) {
//             this.data.variant.set(variant_d.NAME)
//           }
//           this.data.backup.set(newValue)
//         }
//       },
//       synchronize: /** @suppress {globalThis} */ function (newValue) {
//         this.synchronize()
//         var field = this.field
//         var element = field && field.textElement_
//         if (element) {
//           var variant = this.data.variant
//           var i = variant.get() === variant.BUILTIN ? 0 : 1
//           var ra = ['eyo-code', 'eyo-code-reserved']
//           goog.dom.classlist.remove(element, ra[i])
//           goog.dom.classlist.add(element, ra[1 - i])
//         }
//       },
//       consolidate: /** @suppress {globalThis} */ function () {
//         this.didChange(undefined, this.get())
//       },
//       xml: {
//         didLoad: /** @suppress {globalThis} */ function () {
//           if (this.isRequiredFromDom()) {
//             var variant = this.owner.data.variant
//             var current = variant.get()
//             if (current == variant.EXPRESSION) {
//               variant.set(variant.EXPRESSION_ATTRIBUTE)
//             }
//           }
//         }
//       }
//     }
//   },
//   slots: {
//     expression: {
//       order: 11,
//       check: eYo.T3.Expr.Check.primary,
//       plugged: eYo.T3.Expr.primary,
//       hole_value: 'primary',
//       xml: {
//         didLoad: /** @suppress {globalThis} */ function () {
//           if (this.isRequiredFromDom()) {
//             var variant = this.owner.data.variant
//             var current = variant.get()
//             if (current !== variant.EXPRESSION && current !== variant.EXPRESSION_ATTRIBUTE) {
//               var name = this.owner.data.variant.get()
//               variant.set(name.length ? variant.EXPRESSION_ATTRIBUTE : variant.EXPRESSION)
//             }
//           }
//         }
//       }
//     },
//     dot: {
//       order: 20,
//       fields: {
//         separator: '.'
//       }
//     }
//   }
// })

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 * @suppress {globalThis}
*/
// eYo.DelegateSvg.Expr.call_expr.populateMenu = function (block, mgr) {
//   var M = this.data.variant.model
//   var variant = this.data.variant.get()
//   var names = this.data.parent.getAll()
//   var i_name = names.indexOf(this.data.parent.get())
//   var oldValue = block.eyo.data.backup.get()
//   if (variant !== M.NAME) {
//     var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
//       oldValue ? eYo.Do.createSPAN(oldValue, 'eyo-code') : eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
//       eYo.Do.createSPAN('(…)', 'eyo-code')
//     )
//     var menuItem = mgr.newMenuItem(content, this.doAndRender(block, function () {
//       this.data.parent.setTrusted(oldValue || '')
//       this.data.variant.set(M.NAME)
//     }, true))
//     mgr.addChild(menuItem, true)
//   }
//   var F = function (i) {
//     // closure to catch j
//     if (i !== i_name) {
//       content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
//         eYo.Do.createSPAN(names[i], 'eyo-code-reserved'),
//         eYo.Do.createSPAN('(…)', 'eyo-code')
//       )
//       var menuItem = mgr.newMenuItem(content, block.eyo.doAndRender(block, function () {
//         this.data.parent.setTrusted(names[i])
//         this.data.variant.set(M.BUILTIN)
//       }, true))
//       mgr.addChild(menuItem, true)
//     }
//   }
//   for (var i = 0; i < names.length; i++) {
//     F(i)
//   }
//   if (variant !== M.EXPRESSION) {
//     content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
//       eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
//       eYo.Do.createSPAN('(…)', 'eyo-code')
//     )
//     menuItem = mgr.newMenuItem(content, block.eyo.doAndRender(block, function () {
//       this.data.parent.setTrusted(oldValue || '')
//       this.data.variant.set(M.EXPRESSION)
//     }, true))
//     mgr.addChild(menuItem, true)
//   }
//   if (variant !== M.BUILTIN) {
//     mgr.separate()
//     eYo.DelegateSvg.Expr.base_call_expr.populateMenu.call(this, block, mgr)
//   }
//   if (variant !== M.EXPRESSION_ATTRIBUTE) {
//     mgr.separate()
//     content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
//       eYo.Do.createSPAN(eYo.Msg.Placeholder.EXPRESSION, 'eyo-code-placeholder'),
//       eYo.Do.createSPAN('.', 'eyo-code-placeholder'),
//       eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
//       eYo.Do.createSPAN('(…)', 'eyo-code')
//     )
//     menuItem = mgr.newMenuItem(content, block.eyo.doAndRender(block, function () {
//       if (variant === M.BUILTIN) {
//         this.data.parent.setTrusted(oldValue || '')
//       }
//       this.data.variant.set(M.EXPRESSION_ATTRIBUTE)
//     }, true))
//     mgr.addChild(menuItem, true)
//   }
//   mgr.shouldSeparate()
// }

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
// eYo.DelegateSvg.Expr.call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
//   eYo.DelegateSvg.Expr.call_expr.populateMenu.call(this, block, mgr)
//   return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
// }

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('call_stmt', {
  link: eYo.T3.Primary
})

/**
 * Template for contextual menu content.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Stmt.call_stmt.prototype.contentTemplate = eYo.DelegateSvg.Stmt.base_call_stmt.prototype.contentTemplate

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

eYo.DelegateSvg.Expr.primary.T3s = [
  eYo.T3.Primary,
  eYo.T3.Expr.term,
  eYo.T3.Expr.attributeref,
  eYo.T3.Expr.slicing,
  eYo.T3.Expr.subscription,
  eYo.T3.Expr.base_call_expr,
  eYo.T3.Stmt.base_call_stmt,
  eYo.T3.Expr.module__call_expr,
  eYo.T3.Stmt.module__call_stmt,
  eYo.T3.Expr.call_expr,
  eYo.T3.Stmt.call_stmt
]
