/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Assignment')

goog.require('ezP.DelegateSvg.Term')
goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')

//["ezp:attributeref", "ezp:subscription", "ezp:slicing", "ezp:parenth_target_list", "ezp:bracket_target_list", "ezp:target_star", "ezp:identifier", "ezp:any"]

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('target_star', {
  inputs: {
    i_1: {
      key: ezP.Key.EXPRESSION,
      label: '*',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.target,
      hole_value: 'target',
    },
  },
})



/**
 * List consolidator for target list. Used is assignment.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Target = function(D) {
  var d = {}
  goog.mixin(d, ezP.Consolidator.List.Target.data)
  goog.mixin(d, D)
  ezP.Consolidator.List.Target.superClass_.constructor.call(this, d)
}
goog.inherits(ezP.Consolidator.List.Target, ezP.Consolidator.List)

ezP.Consolidator.List.Target.data = {
  hole_value: 'name',
  check: null,
  empty: false,
  presep: ',',
}

ezP.Consolidator.List.makeSubclass('Target', {
  hole_value: 'name',
  check: null,
  empty: false,
  presep: ',',
})

/**
 * List consolidator for target list.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Target.Void = function(D) {
  var d = {}
  goog.mixin(d, ezP.Consolidator.List.Target.Void.data)
  goog.mixin(d, D)
  ezP.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(ezP.Consolidator.List.Target.Void, ezP.Consolidator.List.Target)

ezP.Consolidator.List.Target.Void.data = {
  hole_value: 'name',
  check: null,
  empty: true,
  presep: ',',
}

ezP.Consolidator.List.makeSubclass('Void', {
  empty: true,
}, ezP.Consolidator.List.Target)

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
ezP.Consolidator.List.Target.prototype.getIO = function(block) {
  var io = ezP.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
ezP.Consolidator.List.Target.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the first_starred input
  var Type = {
    UNCONNECTED: 0,
    STARRED: 1,
    OTHER: 2,
  }
    /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function(io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (goog.array.contains(check, ezP.T3.Expr.target_star)) {
      return Type.STARRED
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      if ((io.ezp.parameter_type_ = getCheckType(io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.ezp.parameter_type_ === Type.OTHER) {
        io.last = io.i
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.List.Target.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // move parameters that are not placed correctly (in ezP sense)
    if (io.first_starred>=0) {
      this.setupIO(io, io.first_starred + 2)
      while (!!io.ezp) {
        if (io.ezp.parameter_type_ === Type.STARRED) {
          // disconnect this
          var c8n = io.c8n
          var target = c8n.targetConnection
          c8n.disconnect()
          // remove that input and the next one
          this.disposeAtI(io, io.i)
          this.setupIO(io, io.i)
          this.disposeAtI(io, io.i)
          this.setupIO(io, io.i)
        } else {
          this.setupIO(io, io.i + 2)
        }
      }
    }
  }
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.Target.prototype.getCheck = function (io) {
  if (io.first_starred < 0 || io.i === io.first_starred) {
    return ezP.T3.Expr.Check.target
  } else {
    return ezP.T3.Expr.Check.target_unstar
  }
}

/**
 * Class for a DelegateSvg, target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('target_list', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.List.Target,
      hole_value: 'name',
    },
  },
})

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('void_target_list', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.List.Target.Void,
      hole_value: 'name',
    },
  },
})

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('parenth_target_list', {
  inputs: {
    prefix: {
      label: '(',
    },
    suffix: {
      label: ')',
    }
  },
}, ezP.DelegateSvg.Expr.void_target_list)

/**
 * Class for a DelegateSvg, bracket_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('bracket_target_list', {
  inputs: {
    prefix: {
      label: '[',
    },
    suffix: {
      label: ']',
    }
  },
}, ezP.DelegateSvg.Expr.void_target_list)

goog.provide('ezP.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, target_list_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('target_list_list', {
  inputs: {
    list: {
      check: ezP.T3.Expr.target_list,
      empty: false,
      postsep: '=',
    },
  },
})

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('assignment_stmt', {
  inputs: {
    subtypes: [ezP.T3.Expr.identifier, ezP.T3.Expr.dotted_name, ],
    i_1: {
      term: {
        key:ezP.Key.VALUE,
        value: '',
        placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setValue(block, this.getValue())
        },
      },
    },
    i_2: {
      key: ezP.Key.ANNOTATION,
      label: ':',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    i_3: {
      key: ezP.Key.TARGET,
      wrap: ezP.T3.Expr.target_list_list,
    },
    i_4: {
      key: ezP.Key.ASSIGNED,
      operator: '=',
      wrap: ezP.T3.Expr.assigned_list,
    },
  }
})


/**
 * Init the variant.
 * For that blocks, the variant is a set of flags to control which input should be visible.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.initVariant = function (block) {
  ezP.DelegateSvg.Expr.term.superClass_.initVariant.call(this, block)
  this.setVariant(block, 0)
}

/**
 * Validates the new variant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.validateVariant = function (block, newVariant) {
  return (newVariant == 0 || newVariant == 1 || newVariant == 2)? {validated: newVariant}: null
}

/**
 * Synchronize the variant with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newVariant
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.synchronizeVariant = function(block, newVariant) {
  this.setInputDisabled(block, this.ui.i_1.input, newVariant == 2)
  this.setInputDisabled(block, this.ui.i_2.input, newVariant != 1)
  this.setInputDisabled(block, this.ui.i_3.input, newVariant != 2)
}

/**
 * Initialize the value.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.initValue = function (block) {
  this.setValue(block, this.ui.i_1.fields.value.getValue() || '')
  return
}

/**
 * Synchronize the value with the ui.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} newValue
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.synchronizeValue = function (block, newValue) {
  this.ui.i_1.fields.value.setValue(newValue || '')
}

/**
 * Validates the new value.
 * The type must be one of `dotted_name` or `identifier`.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.validateValue = function (block, newValue) {
  var subtypes = this.getSubtypes(block)
  var subtype = ezP.Do.typeOfString(newValue)
  return subtypes.indexOf(subtype) >= 0? {validated: newValue}: null
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var value = this.getValue(block)
  var current = this.getVariant(block)
  var F = function(content, variant) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.setVariant(block, variant)
    })
    menuItem.setEnabled(variant != current)
    mgr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN(' = …', 'ezp-code'),
  )
  F(content, 0)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN(': … = …', 'ezp-code'),
  )
  F(content, 1)
  var content = ezP.Do.createSPAN('…,… = …,…', 'ezp-code')
  F(content, 2)
  mgr.shouldSeparate()
  if (current != 2) {
    var menuItem = new ezP.MenuItem(ezP.Msg.RENAME, function() {
        block.ezp.ui.i_1.fields.value.showEditor()
      })
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  ezP.DelegateSvg.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

// /**
//  * List consolidator for assignment list.
//  */
// ezP.Consolidator.Assigned = function() {
  
//   if (!goog.isArray(this.constructor.data.checkSingleOnly)) {
//     this.constructor.data.checkSingleOnly = goog.array.filter(this.constructor.data.check, function(x) {
//       this.constructor.data.checkNoSingle.indexOf(x) < 0
//     })
//   }
//   ezP.Consolidator.Assigned.superClass_.constructor.call(this, ezP.Consolidator.Assigned.data)
// }
// goog.inherits(ezP.Consolidator.Assigned, ezP.Consolidator.List)

// ezP.Consolidator.Assigned.data = {
//   check: null,
//   empty: false,
//   presep: ',',
//   check: ezP.T3.Expr.Check.assigned_list,
//   checkNoSingle: ezP.T3.Expr.Check.starred_item_list,
// }

ezP.Consolidator.List.makeSubclass('Assigned', {
  check: null,
  empty: false,
  presep: ',',
  check: ezP.T3.Expr.Check.assigned_list,
  checkNoSingle: ezP.T3.Expr.Check.starred_item_list,
}, ezP.Consolidator.List, ezP.Consolidator)

/**
 * Prepare io, just before walking through the input list for example.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.block} block owner of the receiver
 */
ezP.Consolidator.Assigned.prototype.getIO = function(block) {
  var io = ezP.Consolidator.Assigned.superClass_.getIO.call(this, block)
  io.first_single = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.Assigned.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the key inputs
  var Type = {
    unconnected: 0,
    single: 1,
    other: 2,
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function(io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.unconnected
    }
    var check = target.check_
    var single = this.data.checkSingleOnly
    return goog.array.find(single, function(type) {
      goog.array.contains(check, type)
    })? Type.first_single: Type.other
  }
  var setupFirst = function (io) {
    io.first_single = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      if(Type.first_single === (io.ezp.parameter_type_ = getCheckType(io))) {
        if (io.first_single < 0) {
          io.first_single = io.i
          return
        }
      }                    
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.Assigned.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // there must be an only one
    // first remove all the extra parameters
    if (io.first_single >= 0) {
      this.setupIO(io, 0)
      while(io.first_single>0) {
        this.disposeAtI(io)
        --io.first_single
      }
      this.setupIO(io, 1)
      while (io.list.length>1) {
        this.disposeAtI(io)
      }
    }
  }
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.Assigned.prototype.getCheck = function (io) {
  if (io.first_single >= 0 || (io.list.length === 1) || (io.i === 1 && io.list.length === 3)) {
    return this.data.check
  } else {
    return this.data.checkNoSingle
  }
}

/**
 * Class for a DelegateSvg, assigned_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('assigned_list', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.Assigned,
      hole_value: 'value',
    },
  },
})

goog.provide('ezP.DelegateSvg.AugAssign')

/**
 * Class for a DelegateSvg, augmented_assignment_stmt block.
 * Multiple ops.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('augmented_assignment_stmt', {
  inputs: {
    numberOperators: ['+=','-=','*=','/=','//=','%=','**=','@='],
    bitwiseOperators: ['<<=', '>>=', '&=', '^=', '|='],
    i_1: {
      term: {
        key:ezP.Key.VALUE,
        value: '',
        placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        validator: function(txt) {
          var block = this.sourceBlock_
          if (block) {
            var ezp = block.ezp
            var v = ezp.validateValue(block, goog.isDef(txt)? txt: this.getValue())
            return v && v.validated
          }
        },
        onEndEditing: function () {
          var block = this.sourceBlock_
          var ezp = block.ezp
          ezp.setValue(block, this.getValue())
        },
      },
    },
    i_2: {
      key: ezP.Key.TARGET,
      check: ezP.T3.Expr.Check.augtarget,
    },
    i_3: {
      key: ezP.Key.EXPRESSIONS,
      label: '',
      wrap: ezP.T3.Expr.non_void_expression_list,
    },
    i_4: {
      key: ezP.Key.YIELD,
      label: '',
      check: ezP.T3.Expr.yield_expression,
    },
  },
})

ezP.Delegate.addInstanceProperty(ezP.DelegateSvg.Stmt.augmented_assignment_stmt, 'operator')
ezP.Delegate.addInstanceProperty(ezP.DelegateSvg.Stmt.augmented_assignment_stmt, 'numberOperator')
ezP.Delegate.addInstanceProperty(ezP.DelegateSvg.Stmt.augmented_assignment_stmt, 'bitwiseOperator')

ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.Flag = {
  TARGET: 1,// flags are 1 based
  YIELD: 2,
  BITWISE: 3,
}

/**
 * Validate the value property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.validateValue = function (block, newValue) {
  var type = ezP.Do.typeOfString(newValue)
  return type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
  {validated: newValue}: null
}

/**
 * Synchronize the value property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.synchronizeValue = function (block, newValue) {
  var field = this.ui.i_1.fields.value
  field.setValue(newValue || '')
}

/**
 * Initialize the variant property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.initVariant = function (block) {
  this.setVariant(block, 0) || this.didChangeVariant(block, 0)
}

/**
 * Validate the variant property.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 * @return true if newVariant is acceptable, false otherwise
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.validateVariant = function (block, newVariant) {
  return goog.isNumber(newVariant) && 0 <= newVariant && newVariant < 8?
  {validated: newVariant}: null
}

/**
 * Synchronize the value property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldVariant
 * @param {string} newVariant
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.didChangeVariant = function (block, oldVariant, newVariant) {
  this.initNumberOperator(block)// called only once (in theory)
  this.initBitwiseOperator(block)// called only once (in theory)
  var withBitwise = this.getVariantFlag(block, this.Flag.BITWISE)
  this.setOperator(block, withBitwise? this.getBitwiseOperator(block): this.getNumberOperator(block))
}

/**
 * Synchronize the value property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.synchronizeVariant = function (block, newVariant) {
  var withTarget = this.getVariantFlag(block, this.Flag.TARGET)
  this.setInputDisabled(block, this.ui.i_1.input, withTarget)
  this.setInputDisabled(block, this.ui.i_2.input, !withTarget)
  var withYield = this.getVariantFlag(block, this.Flag.YIELD)
  this.setInputDisabled(block, this.ui.i_3.input, withYield)
  this.setInputDisabled(block, this.ui.i_4.input, !withYield)
}

/**
 * Synchronize the operator property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newOperator
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.synchronizeOperator = function (block, newOperator) {
  console.log('synchronizeOperator', newOperator)
  this.ui.i_3.fields.label.setValue(newOperator)
  this.ui.i_4.fields.label.setValue(newOperator)
}

/**
 * When numberOperator did change, bounce to operator if relevant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldOperator
 * @param {string} newOperator
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.didChangeNumberOperator = function (block, oldOperator, newOperator) {
  var withBitwise = this.getVariantFlag(block, 
  this.Flag.BITWISE)
  console.log('didChangeNumberOperator', withBitwise,newOperator)
  if (!withBitwise) {
    console.log('BOUNCE')
    this.setOperator(block, newOperator)
  }
}
/**
 * When bitwiseOperator did change, bounce to operator if relevant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} oldOperator
 * @param {string} newOperator
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.didChangeBitwiseOperator = function (block, oldOperator, newOperator) {
  var withBitwise = this.getVariantFlag(block, this.Flag.BITWISE)
  console.log('didChangeBitwiseOperator', withBitwise,newOperator)
  if (withBitwise) {
    console.log('BOUNCE')
    this.setOperator(block, newOperator)
  }
}

/**
 * Synchronize the value property with the UI.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newVariant
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.synchronizeOperator = function (block, newOperator) {
  var field = this.ui.i_3.fields.label
  field.setValue(newOperator || '')
  // field.render_()
  field = this.ui.i_4.fields.label
  field.setValue(newOperator || '')
  // field.render_()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  const current = this.getVariant(block)
  var withTarget = this.getVariantFlag(block, this.Flag.TARGET)
  var value = this.getValue(block)
  var operator = this.getOperator(block)
  var withBitwise = this.getVariantFlag(block, this.Flag.BITWISE)
  var operators = withBitwise? 
  this.getBitwiseOperators(block):
  this.getNumberOperators(block)
  var withYield = this.getVariantFlag(block, this.Flag.YIELD)
  var F = function(i) {
    var op = operators[i]
    if (op !== operator) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
        withTarget? ezP.Do.createSPAN('…', 'ezp-code'):
        ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
        ezP.Do.createSPAN(' '+op+' ', 'ezp-code'),
        withYield? 
          ezP.Do.createSPAN('yield …', 'ezp-code-reserved'): 
          ezP.Do.createSPAN('…', 'ezp-code'),
      )
      var menuItem = new ezP.MenuItem(content, function() {
        console.log('Change', withBitwise?'bitwise':'number', 'operator to', op)
        withBitwise? block.ezp.setBitwiseOperator(block, op): block.ezp.setNumberOperator(block, op)
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < operators.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()
  var F = function(variant, content) {
    if (variant !== current) {
      var menuItem = new ezP.MenuItem(content, function() {
        block.ezp.setVariant(block, variant)
      })
      mgr.addChild(menuItem, true)
    }
  }
  var variant = withBitwise? ezP.Do.makeVariantFlags(0, this.Flag.BITWISE): 0
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN(' '+operator+' …', 'ezp-code'),
  )
  F(variant, content)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    goog.dom.createTextNode('… '+operator+' …'),
  )
  F(ezP.Do.makeVariantFlags(variant, this.Flag.TARGET), content)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN(' '+operator+' ', 'ezp-code'),
    ezP.Do.createSPAN('yield', 'ezp-code-reserved'),
    ezP.Do.createSPAN(' …', 'ezp-code'),
  )
  F(ezP.Do.makeVariantFlags(variant, this.Flag.YIELD), content)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    goog.dom.createTextNode('… '+operator+' '),
    ezP.Do.createSPAN('yield', 'ezp-code-reserved'),
    goog.dom.createTextNode(' …'),
  )
  F(ezP.Do.makeVariantFlags(variant, this.Flag.YIELD, this.Flag.TARGET), content)
  mgr.shouldSeparate()
  var content =
  ezP.Do.createSPAN(withBitwise? '+=, -=, /= …': '<<=, >>=, &= …', 'ezp-code')
  var menuItem = function(ezp) {
    return new ezP.MenuItem(content, function() {
      ezp.setVariant(block, ezP.Do.makeVariantFlags(current, withBitwise? -ezp.Flag.BITWISE: ezp.Flag.BITWISE))
  })
  } (this)
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

ezP.DelegateSvg.Assignment.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.target_list,
  ezP.T3.Expr.target_list_list,
  ezP.T3.Expr.void_target_list,
  ezP.T3.Expr.parenth_target_list,
  ezP.T3.Expr.bracket_target_list,
  ezP.T3.Stmt.assignment_stmt,
  ezP.T3.Expr.assigned_list,
  ezP.T3.Stmt.augmented_assignment_stmt,
]